const {validate} = require("./validator");
const {getBasicInfoFromArn, getResourceInfo} = require("./arn");
const aws = require('aws-sdk');
const {createResource} = require("./create");
const {normalizedWebAclProperties} = require("./web-acl");

const updateIpSet = async (
    logicalResourceId,
    resourceType,
    physicalResourceId,
    resourceProperties,
    oldResourceProperties,
) => {
    if (
        resourceProperties.Scope !== oldResourceProperties.Scope
        || resourceProperties.Name !== oldResourceProperties.Name
        || resourceProperties.IPAddressVersion !== oldResourceProperties.IPAddressVersion
    ) {
        return await createResource(logicalResourceId, resourceType, resourceProperties);
    }

    const info = getBasicInfoFromArn(physicalResourceId);
    const ipSetInfo = getResourceInfo(physicalResourceId);
    const client = new aws.WAFV2({apiVersion: 'latest', region: info.region});

    const detail = await client.getIPSet({
        Name: ipSetInfo.name,
        Scope: ipSetInfo.scope,
        Id: ipSetInfo.id,
    }).promise();

    await client.updateIPSet({
        Name: ipSetInfo.name,
        Scope: ipSetInfo.scope,
        Id: ipSetInfo.id,
        Description: resourceProperties.Description || undefined,
        Addresses: resourceProperties.Addresses,
        LockToken: detail.LockToken,
    }).promise();

    return {
        Arn: physicalResourceId,
        Data: {
            Id: ipSetInfo.id,
            Name: ipSetInfo.name,
        },
    };
};

const updateWebAcl = async (
    logicalResourceId,
    resourceType,
    physicalResourceId,
    resourceProperties,
    oldResourceProperties,
) => {
    if (
        resourceProperties.Scope !== oldResourceProperties.Scope
        || resourceProperties.Name !== oldResourceProperties.Name
    ) {
        return await createResource(logicalResourceId, resourceType, resourceProperties);
    }

    const info = getBasicInfoFromArn(physicalResourceId);
    const aclInfo = getResourceInfo(physicalResourceId);
    const client = new aws.WAFV2({apiVersion: 'latest', region: info.region});

    const detail = await client.getWebACL({
        Name: aclInfo.name,
        Scope: aclInfo.scope,
        Id: aclInfo.id,
    }).promise();

    resourceProperties = await normalizedWebAclProperties(resourceProperties, logicalResourceId);

    await client.updateWebACL({
        Name: aclInfo.name,
        Scope: aclInfo.scope,
        Id: aclInfo.id,
        DefaultAction: resourceProperties.DefaultAction,
        Description: resourceProperties.Description,
        Rules: resourceProperties.Rules,
        VisibilityConfig: resourceProperties.VisibilityConfig,
        LockToken: detail.LockToken,
        CustomResponseBodies: resourceProperties.CustomResponseBodies,
        CaptchaConfig: resourceProperties.CaptchaConfig,
    }).promise();

    return {
        Arn: detail.WebACL.ARN,
        Data: {
            Id: detail.WebACL.Id,
            Capacity: detail.WebACL.Capacity,
            LabelNamespace: detail.WebACL.LabelNamespace,
        },
    };
};

exports.updateResource = async (
    logicalResourceId,
    physicalResourceId,
    resourceType,
    resourceProperties,
    oldResourceProperties
) => {
    validate(resourceType, resourceProperties);
    switch (resourceType) {
        case 'Custom::WAFv2IPSet':
            return await updateIpSet(
                logicalResourceId,
                resourceType,
                physicalResourceId,
                resourceProperties,
                oldResourceProperties,
            );
        case 'Custom::WAFv2WebACL':
            return await updateWebAcl(
                logicalResourceId,
                resourceType,
                physicalResourceId,
                resourceProperties,
                oldResourceProperties,
            );
        default:
            throw new Error(`Unknown type: ${resourceType}`);
    }
};