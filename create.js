const {validate} = require("./validator");
const randomString = require('randomstring');
const aws = require('aws-sdk');
const {normalizedWebAclProperties} = require("./web-acl");

const wafClient = new aws.WAFV2({apiVersion: "latest"});

const createWebAcl = async (properties, logicalResourceId) => {
    let client = wafClient;
    if (properties.Scope === 'CLOUDFRONT') {
        client = new aws.WAFV2({region: 'us-east-1', apiVersion: 'latest'});
    }

    properties = await normalizedWebAclProperties(properties, logicalResourceId);
    const name = properties.Name;

    const result = await client.createWebACL({
        Name: name,
        Scope: properties.Scope,
        DefaultAction: properties.DefaultAction,
        Description: properties.Description,
        Rules: properties.Rules,
        VisibilityConfig: properties.VisibilityConfig,
        Tags: properties.Tags,
        CustomResponseBodies: properties.CustomResponseBodies,
        CaptchaConfig: properties.CaptchaConfig,
    }).promise();

    const detail = await client.getWebACL({
        Name: name,
        Scope: properties.Scope,
        Id: result.Summary.Id,
    }).promise();

    return {
        Arn: result.Summary.ARN,
        Data: {
            Id: result.Summary.Id,
            Capacity: detail.WebACL.Capacity,
            LabelNamespace: detail.WebACL.LabelNamespace,
        },
    };
};

const createIpSet = async (properties, logicalResourceId) => {
    let client = wafClient;
    if (properties.Scope === 'CLOUDFRONT') {
        client = new aws.WAFV2({region: 'us-east-1', apiVersion: 'latest'});
    }

    let name;
    if (typeof properties.Name === 'undefined') {
        name = `${logicalResourceId}-${randomString.generate(8)}`;
    } else {
        name = properties.Name;
    }

    const request = {
        Name: name,
        Scope: properties.Scope,
        IPAddressVersion: properties.IPAddressVersion,
        Addresses: properties.Addresses,
        Description: properties.Description,
        Tags: properties.Tags,
    };

    const result = await client.createIPSet(request).promise();

    return {
        Arn: result.Summary.ARN,
        Data: {
            Id: result.Summary.Id,
            Name: result.Summary.Name,
        }
    };
};

exports.createResource = async (logicalResourceId, resourceType, properties) => {
    validate(resourceType, properties);
    switch (resourceType) {
        case 'Custom::WAFv2IPSet':
            return await createIpSet(properties, logicalResourceId);
        case 'Custom::WAFv2WebACL':
            return await createWebAcl(properties, logicalResourceId);
        default:
            throw new Error(`Unknown type: ${resourceType}`);
    }
};