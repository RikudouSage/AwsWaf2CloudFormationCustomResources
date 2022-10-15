const validateRequired = (required, actual) => {
    for (const item of required) {
        if (typeof actual[item] === "undefined") {
            throw new Error(`${item} is a required property`);
        }
    }
};

const validateScope = (scope) => {
    if (scope !== 'CLOUDFRONT' && scope !== 'REGIONAL') {
        throw new Error("Scope must be one of: 'CLOUDFRONT', 'REGIONAL'");
    }
}

const validateIpSet = (properties) => {
    validateRequired([
        'Addresses',
        'IPAddressVersion',
        'Scope',
    ], properties);
    validateScope(properties.Scope);

    if (properties.IPAddressVersion !== 'IPV4' && properties.IPAddressVersion !== 'IPV6') {
        throw new Error("IPAddressVersion must be one of: 'IPV4', 'IPV6'");
    }
};

const validateWebAcl = (properties) => {
    validateRequired([
        'DefaultAction',
        'Scope',
        'VisibilityConfig',
    ], properties);
    validateScope(properties.Scope);
};

exports.validate = (resourceType, properties) => {
    switch (resourceType) {
        case 'Custom::WAFv2IPSet':
            validateIpSet(properties);
            break;
        case 'Custom::WAFv2WebACL':
            validateWebAcl(properties);
            break;
        default:
            throw new Error(`Unknown type: ${resourceType}`);
    }
};