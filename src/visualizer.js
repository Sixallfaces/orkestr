/**
 * Visualizer module for rendering workflow graphs with variable flow annotations
 */

/**
 * Render variable capture annotation
 * @param {string} variableName - Variable being captured
 * @returns {string} Formatted annotation
 */
function renderCaptureAnnotation(variableName) {
  return `    ↓ [captures ${variableName}]`;
}

/**
 * Render variable usage annotation
 * @param {Array<string>} variables - Variables being used
 * @returns {string} Formatted annotation
 */
function renderUsageAnnotation(variables) {
  if (variables.length === 0) return '';

  if (variables.length <= 3) {
    return `[uses ${variables.join(', ')}] ↓`;
  } else {
    const shown = variables.slice(0, 2);
    const remaining = variables.length - 2;
    return `[uses ${shown.join(', ')}, +${remaining} more] ↓`;
  }
}

/**
 * Get status symbol for a node
 * @param {string} status - Node status (pending, executing, completed, failed, skipped)
 * @returns {string} Status symbol
 */
function getStatusSymbol(status) {
  const symbols = {
    'pending': '○',
    'executing': '●',
    'completed': '✓',
    'failed': '✗',
    'skipped': '⊗'
  };
  return symbols[status] || '○';
}

/**
 * Render a single node
 * @param {Object} node - Node to render
 * @returns {string} Formatted node line
 */
function renderNode(node) {
  const status = getStatusSymbol(node.status || 'pending');
  const label = node.agentType || node.agent || node.label || node.id;
  const instruction = node.instruction ? `"${node.instruction}"` : '';
  const captureVar = node.capturesVariable ? `:${node.capturesVariable}` : '';

  return `○ ${label}:${instruction}${captureVar} ${status}`;
}

/**
 * Render a sequence of nodes with variable flow annotations
 * @param {Array<Object>} nodes - Array of nodes to render in sequence
 * @returns {string} Formatted sequence visualization
 */
function renderSequence(nodes) {
  let output = '';

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    output += renderNode(node);

    if (i < nodes.length - 1) {
      // Show what this node captures
      if (node.capturesVariable) {
        output += '\n' + renderCaptureAnnotation(node.capturesVariable);
      }

      // Show what next node uses
      const nextNode = nodes[i + 1];
      if (nextNode.usesVariables && nextNode.usesVariables.length > 0) {
        const usageAnnotation = renderUsageAnnotation(nextNode.usesVariables);
        output += '\n' + usageAnnotation;
      } else {
        output += '\n    ↓';
      }
    }
  }

  return output;
}

/**
 * Render parallel branches
 * @param {Array<Array<Object>>} branches - Array of branch arrays
 * @returns {string} Formatted parallel branches
 */
function renderParallelBranches(branches) {
  let output = '';

  // Find longest branch for alignment
  const maxDepth = Math.max(...branches.map(b => b.length));

  // Opening
  output += '    ┌───┴───┐\n';

  // Render each level
  for (let level = 0; level < maxDepth; level++) {
    const branchLines = [];

    for (const branch of branches) {
      if (level < branch.length) {
        const node = branch[level];
        const status = getStatusSymbol(node.status || 'pending');
        const label = node.agentType || node.agent || node.label || node.id;
        branchLines.push(`[${label}] ${status}`);
      } else {
        branchLines.push('         '); // Empty space
      }
    }

    output += '  ' + branchLines.join('  ') + '\n';

    // Connector
    if (level < maxDepth - 1) {
      const connectors = branches.map((b, i) =>
        level < b.length - 1 ? '    │' : '     '
      );
      output += '  ' + connectors.join('  ') + '\n';
    }
  }

  // Closing
  output += '    └───┬───┘';

  return output;
}

/**
 * Render parallel branches with variable flow after merge point
 * @param {Array<Array<Object>>} branches - Array of branch arrays
 * @param {Object} nextNode - Next node after parallel merge
 * @returns {string} Formatted parallel visualization with variable flow
 */
function renderParallel(branches, nextNode) {
  let output = renderParallelBranches(branches);

  // After merge point, show what variables are being used
  if (nextNode && nextNode.usesVariables && nextNode.usesVariables.length > 0) {
    output += '\n                   ↓';
    output += '\n         ' + renderUsageAnnotation(nextNode.usesVariables);
  }

  if (nextNode) {
    output += '\n' + renderNode(nextNode);
  }

  return output;
}

/**
 * Render a complete workflow graph
 * @param {Object} graph - Graph object with nodes and edges
 * @returns {string} Formatted graph visualization
 */
function renderGraph(graph) {
  const lines = [];
  const rendered = new Set();

  function renderNodeRecursive(nodeId, indent = 0) {
    if (rendered.has(nodeId)) {
      lines.push(`${' '.repeat(indent * 4)}[${nodeId}] (see above)`);
      return;
    }

    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return;

    rendered.add(nodeId);

    const status = getStatusSymbol(node.status || 'pending');
    const label = node.agentType || node.agent || node.label || node.id;
    lines.push(`${' '.repeat(indent * 4)}[${label}] ${status}`);

    // Find outgoing edges
    const outgoing = graph.edges.filter(e => e.from === nodeId);

    if (outgoing.length === 0) return;

    if (outgoing.length === 1) {
      // Simple sequence
      lines.push(`${' '.repeat(indent * 4)}    │`);
      renderNodeRecursive(outgoing[0].to, indent);
    } else {
      // Parallel branches
      lines.push(`${' '.repeat(indent * 4)}    ┌${'─'.repeat(outgoing.length * 3)}┐`);

      for (const edge of outgoing) {
        renderNodeRecursive(edge.to, indent + 1);
      }

      lines.push(`${' '.repeat(indent * 4)}    └${'─'.repeat(outgoing.length * 3)}┘`);
    }
  }

  // Find start nodes
  const startNodes = graph.nodes.filter(node =>
    !graph.edges.some(edge => edge.to === node.id)
  );

  for (const start of startNodes) {
    renderNodeRecursive(start.id);
  }

  return lines.join('\n');
}

module.exports = {
  renderCaptureAnnotation,
  renderUsageAnnotation,
  getStatusSymbol,
  renderNode,
  renderSequence,
  renderParallel,
  renderParallelBranches,
  renderGraph
};
