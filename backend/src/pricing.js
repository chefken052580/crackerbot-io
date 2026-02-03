// CrackerBot Pricing & Usage System
// Version: v2025-12-07

/**
 * Pricing Tiers Configuration
 */
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    perBuildPrice: 0,
    maxTokens: 2000,
    freeBuilds: 3,
    freeRefinesPerProject: 2,
    maxProjectsPerMonth: 3,
    features: ['Basic templates', 'Standard support']
  },
  basic: {
    name: 'Basic',
    monthlyPrice: 5.00,
    perBuildPrice: 0.50,
    maxTokens: 4000,
    freeBuilds: 0,
    freeRefinesPerProject: 3,
    maxProjectsPerMonth: 10,
    features: ['Quality templates', 'Priority support', 'Custom themes']
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 15.00,
    perBuildPrice: 1.50,
    maxTokens: 8000,
    freeBuilds: 0,
    freeRefinesPerProject: 5,
    maxProjectsPerMonth: -1, // unlimited
    features: ['Premium templates', 'Priority support', 'Custom themes', 'Advanced features', 'API access']
  },
  paygo: {
    name: 'Pay As You Go',
    monthlyPrice: 0,
    perBuildPrice: 0.25, // basic build
    premiumBuildPrice: 0.50,
    refinePrice: 0.10,
    maxTokens: 4000,
    premiumMaxTokens: 8000,
    freeBuilds: 1, // 1 free to try
    freeRefinesPerProject: 1,
    maxProjectsPerMonth: -1,
    features: ['Flexible pricing', 'No commitment']
  }
};

/**
 * AI Cost Tracking (for internal metrics)
 */
export const AI_COSTS = {
  claude: {
    inputPerMillion: 3.00,
    outputPerMillion: 15.00
  },
  openai: {
    inputPerMillion: 0.50,
    outputPerMillion: 1.50
  }
};

/**
 * Calculate estimated AI cost for a build
 */
export function estimateAICost(maxTokens, model = 'claude') {
  const costs = AI_COSTS[model];
  const estimatedInputTokens = 800;
  const estimatedOutputTokens = maxTokens * 0.6; // Usually uses ~60% of max
  
  const inputCost = (estimatedInputTokens / 1000000) * costs.inputPerMillion;
  const outputCost = (estimatedOutputTokens / 1000000) * costs.outputPerMillion;
  
  return {
    inputCost: inputCost.toFixed(4),
    outputCost: outputCost.toFixed(4),
    totalCost: (inputCost + outputCost).toFixed(4)
  };
}

/**
 * User usage tracking schema
 */
export const createUserUsage = (userId) => ({
  userId,
  tier: 'free',
  subscriptionExpires: null,
  builds: {
    total: 0,
    thisMonth: 0,
    free: {
      used: 0,
      limit: PRICING_TIERS.free.freeBuilds
    }
  },
  refines: {
    total: 0,
    byProject: {} // projectId: { used: 0, free: 2 }
  },
  credits: 0, // Pay-as-you-go credits in cents
  totalSpent: 0,
  createdAt: new Date(),
  updatedAt: new Date()
});

/**
 * Check if user can build
 */
export function canUserBuild(usage) {
  const tier = PRICING_TIERS[usage.tier];
  
  // Check free builds first
  if (usage.builds.free.used < usage.builds.free.limit) {
    return { allowed: true, reason: 'free_build', cost: 0 };
  }
  
  // Check subscription limits
  if (usage.tier !== 'free' && usage.tier !== 'paygo') {
    if (tier.maxProjectsPerMonth === -1 || usage.builds.thisMonth < tier.maxProjectsPerMonth) {
      return { allowed: true, reason: 'subscription', cost: 0 };
    }
    return { allowed: false, reason: 'monthly_limit_reached', cost: tier.perBuildPrice };
  }
  
  // Pay-as-you-go check credits
  if (usage.tier === 'paygo') {
    const costCents = tier.perBuildPrice * 100;
    if (usage.credits >= costCents) {
      return { allowed: true, reason: 'credits', cost: tier.perBuildPrice };
    }
    return { allowed: false, reason: 'insufficient_credits', cost: tier.perBuildPrice };
  }
  
  // Free tier exhausted
  return { allowed: false, reason: 'free_exhausted', cost: PRICING_TIERS.basic.perBuildPrice };
}

/**
 * Check if user can refine a project
 */
export function canUserRefine(usage, projectId) {
  const tier = PRICING_TIERS[usage.tier];
  const projectRefines = usage.refines.byProject[projectId] || { used: 0, free: tier.freeRefinesPerProject };
  
  // Check free refines for this project
  if (projectRefines.used < projectRefines.free) {
    return { allowed: true, reason: 'free_refine', cost: 0, remaining: projectRefines.free - projectRefines.used };
  }
  
  // Pay-as-you-go allows paid refines
  if (usage.tier === 'paygo') {
    const costCents = PRICING_TIERS.paygo.refinePrice * 100;
    if (usage.credits >= costCents) {
      return { allowed: true, reason: 'paid_refine', cost: PRICING_TIERS.paygo.refinePrice, remaining: 0 };
    }
    return { allowed: false, reason: 'insufficient_credits', cost: PRICING_TIERS.paygo.refinePrice, remaining: 0 };
  }
  
  // Subscriptions get unlimited paid refines at no extra cost
  if (usage.tier === 'basic' || usage.tier === 'pro') {
    return { allowed: true, reason: 'subscription_refine', cost: 0, remaining: 'unlimited' };
  }
  
  return { allowed: false, reason: 'refines_exhausted', cost: 0.10, remaining: 0 };
}

/**
 * Record a build
 */
export function recordBuild(usage, wasFree = false) {
  usage.builds.total++;
  usage.builds.thisMonth++;
  if (wasFree) {
    usage.builds.free.used++;
  }
  usage.updatedAt = new Date();
  return usage;
}

/**
 * Record a refine
 */
export function recordRefine(usage, projectId, wasFree = false) {
  usage.refines.total++;
  if (!usage.refines.byProject[projectId]) {
    const tier = PRICING_TIERS[usage.tier];
    usage.refines.byProject[projectId] = { used: 0, free: tier.freeRefinesPerProject };
  }
  usage.refines.byProject[projectId].used++;
  usage.updatedAt = new Date();
  return usage;
}

/**
 * Get max tokens for user's tier
 */
export function getMaxTokensForTier(tier, isPremium = false) {
  const config = PRICING_TIERS[tier];
  if (!config) return 2000;
  
  if (tier === 'paygo' && isPremium) {
    return config.premiumMaxTokens;
  }
  
  return config.maxTokens;
}

/**
 * Format usage summary for display
 */
export function formatUsageSummary(usage) {
  const tier = PRICING_TIERS[usage.tier];
  const freeBuildsRemaining = Math.max(0, usage.builds.free.limit - usage.builds.free.used);
  
  return {
    tier: tier.name,
    freeBuildsRemaining,
    buildsThisMonth: usage.builds.thisMonth,
    monthlyLimit: tier.maxProjectsPerMonth === -1 ? 'Unlimited' : tier.maxProjectsPerMonth,
    credits: (usage.credits / 100).toFixed(2),
    totalProjects: usage.builds.total
  };
}

console.log('💰 CrackerBot Pricing System loaded');
console.log('Tiers:', Object.keys(PRICING_TIERS).join(', '));
