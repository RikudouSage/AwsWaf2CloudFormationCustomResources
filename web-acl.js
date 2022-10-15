const randomString = require("randomstring");

exports.normalizedWebAclProperties = async (properties, logicalResourceId) => {
    if (typeof properties.Name === 'undefined') {
        properties.Name = `${logicalResourceId}-${randomString.generate(8)}`;
    }

    const rules = properties?.Rules || [];
    for (const i in rules) {
        if (!rules.hasOwnProperty(i)) {
            continue;
        }
        const rule = rules[i];

        if (typeof rule?.Statement?.IPSetReferenceStatement?.Arn !== 'undefined') {
            rule.Statement.IPSetReferenceStatement.ARN = rule.Statement.IPSetReferenceStatement.Arn;
            rule.Statement.IPSetReferenceStatement.Arn = undefined;
        }

        if (typeof rule?.VisibilityConfig !== 'undefined') {
            if (rule.VisibilityConfig.SampledRequestsEnabled === 'true') {
                rule.VisibilityConfig.SampledRequestsEnabled = true;
            }
            if (rule.VisibilityConfig.SampledRequestsEnabled === 'false') {
                rule.VisibilityConfig.SampledRequestsEnabled = false;
            }
            if (rule.VisibilityConfig.CloudWatchMetricsEnabled === 'true') {
                rule.VisibilityConfig.CloudWatchMetricsEnabled = true;
            }
            if (rule.VisibilityConfig.CloudWatchMetricsEnabled === 'false') {
                rule.VisibilityConfig.CloudWatchMetricsEnabled = false;
            }
        }

        if (typeof rule.Name === 'undefined') {
            rule.Name = `Rule${Number(i) + 1}_${randomString.generate(8)}`;
        }
    }

    if (typeof properties.VisibilityConfig !== 'undefined') {
        if (properties.VisibilityConfig.SampledRequestsEnabled === 'true') {
            properties.VisibilityConfig.SampledRequestsEnabled = true;
        }
        if (properties.VisibilityConfig.SampledRequestsEnabled === 'false') {
            properties.VisibilityConfig.SampledRequestsEnabled = false;
        }
        if (properties.VisibilityConfig.CloudWatchMetricsEnabled === 'true') {
            properties.VisibilityConfig.CloudWatchMetricsEnabled = true;
        }
        if (properties.VisibilityConfig.CloudWatchMetricsEnabled === 'false') {
            properties.VisibilityConfig.CloudWatchMetricsEnabled = false;
        }
    }

    return properties;
};