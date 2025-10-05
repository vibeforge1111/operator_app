/**
 * Fee Routing System - The flow of value through the Operator Network
 */

// Constants: Fee split ratios
const FEE_SPLITS = {
    OPERATOR: 0.6,    // 60% to operators
    PROTOCOL: 0.2,    // 20% to protocol
    BUYBACK: 0.1,     // 10% for buyback
    TREASURY: 0.1     // 10% to treasury
};

// Mock Registry: Dummy operators
const OPERATOR_REGISTRY = [
    { id: 'Operator_001', name: 'Alpha Node', active: true },
    { id: 'Operator_002', name: 'Beta Node', active: true },
    { id: 'Operator_003', name: 'Gamma Node', active: true },
    { id: 'Operator_004', name: 'Delta Node', active: false }
];

// Route function: Takes an amount and splits it
function route(amount: number) {
    const operator = amount * FEE_SPLITS.OPERATOR;
    const protocol = amount * FEE_SPLITS.PROTOCOL;
    const buyback = amount * FEE_SPLITS.BUYBACK;
    const treasury = amount * FEE_SPLITS.TREASURY;

    // Select a random active operator
    const activeOperators = OPERATOR_REGISTRY.filter(op => op.active);
    const selectedOperator = activeOperators[Math.floor(Math.random() * activeOperators.length)];

    console.log(`[ROUTE] Amount: ${amount} | Operator: ${selectedOperator.name} receives ${operator.toFixed(2)} | Protocol: ${protocol.toFixed(2)} | Buyback: ${buyback.toFixed(2)} | Treasury: ${treasury.toFixed(2)}`);

    return {
        operator,
        protocol,
        buyback,
        treasury,
        operatorId: selectedOperator.id
    };
}

// Export for use in heartbeat
export { route, FEE_SPLITS, OPERATOR_REGISTRY };