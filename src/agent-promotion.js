const agentManager = require('./agent-manager');
const fs = require('fs');
const path = require('path');

/**
 * Analyze if a temp agent is reusable (generic vs workflow-specific)
 * @param {string} agentName - Temp agent name
 * @returns {Object} {isReusable: boolean, reason: string}
 */
function analyzeReusability(agentName) {
  const agentPath = path.join(__dirname, '../temp-agents', `${agentName}.md`);

  if (!fs.existsSync(agentPath)) {
    return { isReusable: false, reason: 'Agent not found' };
  }

  const content = fs.readFileSync(agentPath, 'utf8');

  // Indicators of workflow-specific agents
  const specificIndicators = [
    /src\/[a-zA-Z0-9\/-]+\.(js|ts|py)/,  // Specific file paths
    /line \d+/i,                          // Line numbers
    /fix.*bug.*in/i,                      // Bug fix references
    /(this project|our codebase)/i        // Project-specific language
  ];

  // Indicators of generic agents
  const genericIndicators = [
    /analyze|scan|check|review|test/i,    // Generic action verbs
    /responsibilities:/i,                  // Structured format
    /output format:/i                      // Formal output spec
  ];

  const hasSpecificIndicators = specificIndicators.some(pattern => pattern.test(content));
  const hasGenericIndicators = genericIndicators.some(pattern => pattern.test(content));

  if (hasSpecificIndicators) {
    return {
      isReusable: false,
      reason: 'Contains workflow-specific references (file paths, line numbers, or project-specific context)'
    };
  }

  if (hasGenericIndicators) {
    return {
      isReusable: true,
      reason: 'Generic capability with structured format - likely useful for other workflows'
    };
  }

  // Default: if unclear, suggest based on agent name
  const genericNamePattern = /^(analyzer|scanner|checker|reviewer|tester|fixer|validator|formatter)/i;
  if (genericNamePattern.test(agentName)) {
    return {
      isReusable: true,
      reason: 'Generic agent name suggests reusable pattern'
    };
  }

  return {
    isReusable: false,
    reason: 'Insufficient indicators of reusability'
  };
}

/**
 * Generate agent promotion suggestions
 * @param {Array<string>} tempAgentNames - Names of temp agents used
 * @returns {Array<Object>} Array of {name, isRecommended, reason}
 */
function generatePromotionSuggestions(tempAgentNames) {
  return tempAgentNames.map(name => {
    const analysis = analyzeReusability(name);
    return {
      name,
      isRecommended: analysis.isReusable,
      reason: analysis.reason
    };
  });
}

/**
 * Format promotion prompt for user
 * @param {Array<Object>} suggestions - Promotion suggestions
 * @returns {string} Formatted prompt text
 */
function formatPromotionPrompt(suggestions) {
  let prompt = 'Temp agents used in this workflow:\n\n';

  for (const suggestion of suggestions) {
    const icon = suggestion.isRecommended ? '✓ [Recommended]' : '✗ [Not recommended]';
    prompt += `${icon} ${suggestion.name}\n`;
    prompt += `  ${suggestion.reason}\n\n`;
  }

  prompt += 'Select which agents to save as permanent defined agents:';

  return prompt;
}

/**
 * Process agent promotions
 * @param {Array<string>} selectedNames - Names of agents to promote
 * @returns {Object} {promoted: Array, failed: Array}
 */
function processPromotions(selectedNames) {
  const results = {
    promoted: [],
    failed: []
  };

  for (const name of selectedNames) {
    // Check for name conflicts
    if (agentManager.agentExists(name) &&
        agentManager.findAgent(name).source === 'defined') {
      results.failed.push({
        name,
        reason: 'Agent already exists in defined agents'
      });
      continue;
    }

    // Promote agent
    const success = agentManager.promoteAgent(name);
    if (success) {
      results.promoted.push(name);
    } else {
      results.failed.push({
        name,
        reason: 'Failed to promote agent'
      });
    }
  }

  return results;
}

/**
 * Clean up unselected temp agents
 * @param {Array<string>} allTempAgents - All temp agent names
 * @param {Array<string>} selectedNames - Names of agents to keep
 */
function cleanupTempAgents(allTempAgents, selectedNames) {
  const toDelete = allTempAgents.filter(name => !selectedNames.includes(name));

  for (const name of toDelete) {
    agentManager.deleteTempAgent(name);
  }

  return toDelete;
}

module.exports = {
  analyzeReusability,
  generatePromotionSuggestions,
  formatPromotionPrompt,
  processPromotions,
  cleanupTempAgents
};
