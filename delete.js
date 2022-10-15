const aws = require('aws-sdk');
const {getBasicInfoFromArn, getResourceInfo} = require("./arn");

const deleteIpSet = async (physicalId) => {
    const info = getBasicInfoFromArn(physicalId);
    const client = new aws.WAFV2({apiVersion: 'latest', region: info.region});
    const ipSetInfo = getResourceInfo(physicalId);

    const detail = await client.getIPSet({
        Name: ipSetInfo.name,
        Scope: ipSetInfo.scope,
        Id: ipSetInfo.id,
    }).promise();

    await client.deleteIPSet({
        Id: ipSetInfo.id,
        Name: ipSetInfo.name,
        Scope: ipSetInfo.scope,
        LockToken: detail.LockToken,
    }).promise();

    return {};
};

const deleteWebAcl = async (physicalId) => {
    const info = getBasicInfoFromArn(physicalId);
    const client = new aws.WAFV2({apiVersion: 'latest', region: info.region});
    const webAclInfo = getResourceInfo(physicalId);

    const detail = await client.getWebACL({
        Name: webAclInfo.name,
        Scope: webAclInfo.scope,
        Id: webAclInfo.id,
    }).promise();

    await client.deleteWebACL({
        Id: webAclInfo.id,
        Name: webAclInfo.name,
        Scope: webAclInfo.scope,
        LockToken: detail.LockToken,
    }).promise();

    return {};
};

exports.deleteResource = async (resourceType, physicalId) => {
    if (physicalId === 'failed-to-create') {
        return {};
    }
    switch (resourceType) {
        case 'Custom::WAFv2IPSet':
            return await deleteIpSet(physicalId);
        case 'Custom::WAFv2WebACL':
            return await deleteWebAcl(physicalId);
        default:
            throw new Error(`Unknown resource type: ${resourceType}`);
    }
};