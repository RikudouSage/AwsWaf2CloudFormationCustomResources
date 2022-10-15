exports.getBasicInfoFromArn = function (arn) {
    const parts = arn.split(':');
    return {
        service: parts[2],
        region: parts[3],
        accountId: parts[4],
    };
};

exports.getResourceInfo = function (arn) {
    const parts = arn.split(':');
    const idPart = parts[5];
    const idParts = idPart.split('/');

    return {
        scope: idParts[0] === 'global' ? 'CLOUDFRONT' : 'REGIONAL',
        name: idParts[2],
        id: idParts[3],
    };
}