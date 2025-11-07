/**
 * Temporary Agents Executor
 *
 * Handles runtime variable interpolation and output capture for temporary agents
 */

/**
 * Interpolate variables in instruction text
 * @param {string} instruction - Instruction with {var} placeholders
 * @param {Object} variables - Map of variable name to value
 * @returns {string} Interpolated instruction
 */
function interpolateVariables(instruction, variables) {
  if (!instruction) return instruction;

  return instruction.replace(/\{(\w+)\}/g, (match, varName) => {
    if (variables.hasOwnProperty(varName)) {
      const value = variables[varName];

      if (value === null || value === undefined) {
        throw new Error(
          `Variable '${varName}' is referenced but has no value yet. ` +
          `Make sure the agent that produces this variable runs first.`
        );
      }

      // Convert to string and truncate if too long
      const str = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

      // Truncate long outputs
      const MAX_LENGTH = 2000;
      if (str.length > MAX_LENGTH) {
        return str.substring(0, MAX_LENGTH) + '\n\n... (truncated)';
      }

      return str;
    }

    // Variable not found - this is an error
    throw new Error(
      `Unknown variable '{${varName}}' in instruction. ` +
      `Available variables: ${Object.keys(variables).join(', ') || 'none'}`
    );
  });
}

/**
 * Check if node is ready to execute (all variable dependencies satisfied)
 * @param {Object} node - Graph node
 * @param {Object} variables - Current variable values
 * @returns {{ready: boolean, missing?: string[]}}
 */
function checkNodeVariableDependencies(node, variables) {
  if (!node.templateVars || node.templateVars.length === 0) {
    return { ready: true };
  }

  const missing = [];

  for (const varName of node.templateVars) {
    if (!variables.hasOwnProperty(varName) || variables[varName] === null) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    return { ready: false, missing };
  }

  return { ready: true };
}

/**
 * Prepare node instruction for execution (interpolate variables)
 * @param {Object} node - Graph node
 * @param {Object} variables - Current variable values
 * @returns {string} Instruction with variables interpolated
 */
function prepareNodeInstruction(node, variables) {
  if (!node.instruction) {
    return node.instruction;
  }

  // Check dependencies first
  const depCheck = checkNodeVariableDependencies(node, variables);
  if (!depCheck.ready) {
    throw new Error(
      `Cannot execute node '${node.id}': missing variables: ${depCheck.missing.join(', ')}`
    );
  }

  // Interpolate variables
  try {
    return interpolateVariables(node.instruction, variables);
  } catch (error) {
    throw new Error(`Failed to prepare instruction for node '${node.id}': ${error.message}`);
  }
}

/**
 * Capture node output to variable (if node has outputVar)
 * @param {Object} node - Graph node
 * @param {*} output - Execution result
 * @param {Object} variables - Variables map to update
 */
function captureNodeOutput(node, output, variables) {
  if (!node.outputVar) {
    return;
  }

  // Store the output
  variables[node.outputVar] = output;

  console.log(`✓ Captured output to variable '${node.outputVar}'`);
}

/**
 * Execute agent node with temp agent support
 * @param {Object} node - Graph node
 * @param {Object} state - Execution state
 * @param {Function} taskFn - Task function to call
 * @returns {Promise<*>} Execution result
 */
async function executeAgentWithTempAgents(node, state, taskFn) {
  // Prepare instruction (interpolate variables)
  const instruction = prepareNodeInstruction(node, state.graph.variables || {});

  // Build Task parameters
  const taskParams = {
    subagent_type: node.agent,
    description: node.tempAgentName
      ? `Temp agent: ${node.tempAgentName}`
      : `Execute ${node.agent}`,
    prompt: instruction
  };

  // Add model override if present
  if (node.model) {
    taskParams.model = node.model;
  }

  // Execute
  console.log(`\nExecuting ${node.tempAgentName || node.agent}...`);
  if (node.outputVar) {
    console.log(`  → Will capture output to: ${node.outputVar}`);
  }

  const result = await taskFn(taskParams);

  // Capture output
  if (node.outputVar) {
    captureNodeOutput(node, result, state.graph.variables || {});
  }

  return result;
}

/**
 * Get summary of current variables
 * @param {Object} variables - Variables map
 * @returns {string} Formatted summary
 */
function getVariablesSummary(variables) {
  if (!variables || Object.keys(variables).length === 0) {
    return 'No variables captured yet.';
  }

  const lines = ['Current variables:'];

  for (const [name, value] of Object.entries(variables)) {
    const preview = value
      ? (typeof value === 'string' ? value.substring(0, 50) : JSON.stringify(value).substring(0, 50))
      : '(empty)';

    lines.push(`  ${name}: ${preview}${preview.length >= 50 ? '...' : ''}`);
  }

  return lines.join('\n');
}

/**
 * Validate graph for temp agent requirements
 * @param {Object} graph - Parsed graph
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateTempAgentGraph(graph) {
  const errors = [];

  if (!graph.tempAgents) {
    return { valid: true, errors: [] }; // No temp agents used
  }

  // Check for circular variable dependencies
  const varDeps = new Map(); // varName -> [nodes that depend on it]

  for (const node of graph.nodes) {
    if (node.templateVars) {
      for (const varName of node.templateVars) {
        if (!varDeps.has(varName)) {
          varDeps.set(varName, []);
        }
        varDeps.get(varName).push(node.id);
      }
    }
  }

  // Check that all referenced variables are produced
  const producedVars = new Set(
    graph.nodes.filter(n => n.outputVar).map(n => n.outputVar)
  );

  for (const [varName, dependentNodes] of varDeps.entries()) {
    if (!producedVars.has(varName)) {
      errors.push(
        `Variable '${varName}' is referenced by nodes [${dependentNodes.join(', ')}] ` +
        `but no node produces it. Add ':${varName}' to an agent invocation to capture output.`
      );
    }
  }

  // Check that producers come before consumers in graph
  for (const node of graph.nodes) {
    if (node.templateVars) {
      for (const varName of node.templateVars) {
        const producer = graph.nodes.find(n => n.outputVar === varName);
        if (producer) {
          // Simple check: producer should have lower node ID (comes earlier in sequence)
          // This is a heuristic - full topological check would be more accurate
          const producerIndex = graph.nodes.indexOf(producer);
          const consumerIndex = graph.nodes.indexOf(node);

          if (producerIndex >= consumerIndex) {
            errors.push(
              `Variable '${varName}' is used by node '${node.id}' before it's produced. ` +
              `Make sure the agent that produces '${varName}' runs first.`
            );
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Export functions
module.exports = {
  interpolateVariables,
  prepareNodeInstruction,
  captureNodeOutput,
  executeAgentWithTempAgents,
  checkNodeVariableDependencies,
  getVariablesSummary,
  validateTempAgentGraph
};
