const {createResource} = require("./create");
const {deleteResource} = require("./delete");
const {updateResource} = require("./update");
const fetch = require("node-fetch");

exports.handle = async (event) => {
    let result = {
        Status: '', // SUCCESS or FAILED
        Reason: '', // only for FAILED
        PhysicalResourceId: '',
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: {
            Arn: '',
        },
    };

    let resourceResult;

    try {
        switch (event.RequestType) {
            case 'Create':
                resourceResult = await createResource(event.LogicalResourceId, event.ResourceType, event.ResourceProperties);
                break;
            case 'Delete':
                resourceResult = await deleteResource(event.ResourceType, event.PhysicalResourceId);
                break;
            case 'Update':
                resourceResult = await updateResource(
                    event.LogicalResourceId,
                    event.PhysicalResourceId,
                    event.ResourceType,
                    event.ResourceProperties,
                    event.OldResourceProperties
                );
                break;
        }

        if (typeof resourceResult === 'undefined') {
            throw new Error('Unknown operation');
        }

        const regex = /^arn:aws:.*$/;
        let physicalResourceId = 'failed-to-create';
        if (regex.test(resourceResult.Arn)) {
            physicalResourceId = resourceResult.Arn;
        } else if (typeof event.PhysicalResourceId !== 'undefined') {
            physicalResourceId = event.PhysicalResourceId;
        }

        result.Status = 'SUCCESS';
        result.PhysicalResourceId = physicalResourceId;
        result.Data = resourceResult.Data || {};
        result.Data.Arn = resourceResult.Arn;
    } catch (e) {
        result.Status = 'FAILED';
        result.Reason = e.message;
        result.PhysicalResourceId = 'failed-to-create';
    }

    const url = event.ResponseURL;
    await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
    });
};
