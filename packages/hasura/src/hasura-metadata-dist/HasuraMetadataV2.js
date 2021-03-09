/* eslint-disable */
"use strict";
// To parse this data:
//
//   import { Convert, TableName, QualifiedTable, TableConfig, TableEntry, CustomRootFields, FunctionName, QualifiedFunction, CustomFunction, FunctionConfiguration, ObjectRelationship, ObjRelUsing, ObjRelUsingManualMapping, ArrayRelationship, ArrRelUsing, ArrRelUsingFKeyOn, ArrRelUsingManualMapping, InsertPermissionEntry, InsertPermission, SelectPermissionEntry, SelectPermission, UpdatePermissionEntry, UpdatePermission, DeletePermissionEntry, DeletePermission, ComputedField, ComputedFieldDefinition, EventTrigger, EventTriggerDefinition, EventTriggerColumns, OperationSpec, HeaderFromValue, HeaderFromEnv, RetryConf, CronTrigger, RetryConfST, RemoteSchema, RemoteSchemaDef, RemoteRelationship, RemoteRelationshipDef, QueryCollectionEntry, QueryCollection, AllowList, CustomTypes, InputObjectType, InputObjectField, ObjectType, ObjectField, CustomTypeObjectRelationship, ScalarType, EnumType, EnumValue, Action, ActionDefinition, InputArgument, HasuraMetadataV2 } from "./file";
//
//   const pGColumn = Convert.toPGColumn(json);
//   const computedFieldName = Convert.toComputedFieldName(json);
//   const roleName = Convert.toRoleName(json);
//   const triggerName = Convert.toTriggerName(json);
//   const remoteRelationshipName = Convert.toRemoteRelationshipName(json);
//   const remoteSchemaName = Convert.toRemoteSchemaName(json);
//   const collectionName = Convert.toCollectionName(json);
//   const graphQLName = Convert.toGraphQLName(json);
//   const graphQLType = Convert.toGraphQLType(json);
//   const relationshipName = Convert.toRelationshipName(json);
//   const actionName = Convert.toActionName(json);
//   const webhookURL = Convert.toWebhookURL(json);
//   const tableName = Convert.toTableName(json);
//   const qualifiedTable = Convert.toQualifiedTable(json);
//   const tableConfig = Convert.toTableConfig(json);
//   const tableEntry = Convert.toTableEntry(json);
//   const customRootFields = Convert.toCustomRootFields(json);
//   const customColumnNames = Convert.toCustomColumnNames(json);
//   const functionName = Convert.toFunctionName(json);
//   const qualifiedFunction = Convert.toQualifiedFunction(json);
//   const customFunction = Convert.toCustomFunction(json);
//   const functionConfiguration = Convert.toFunctionConfiguration(json);
//   const objectRelationship = Convert.toObjectRelationship(json);
//   const objRelUsing = Convert.toObjRelUsing(json);
//   const objRelUsingManualMapping = Convert.toObjRelUsingManualMapping(json);
//   const arrayRelationship = Convert.toArrayRelationship(json);
//   const arrRelUsing = Convert.toArrRelUsing(json);
//   const arrRelUsingFKeyOn = Convert.toArrRelUsingFKeyOn(json);
//   const arrRelUsingManualMapping = Convert.toArrRelUsingManualMapping(json);
//   const columnPresetsExpression = Convert.toColumnPresetsExpression(json);
//   const insertPermissionEntry = Convert.toInsertPermissionEntry(json);
//   const insertPermission = Convert.toInsertPermission(json);
//   const selectPermissionEntry = Convert.toSelectPermissionEntry(json);
//   const selectPermission = Convert.toSelectPermission(json);
//   const updatePermissionEntry = Convert.toUpdatePermissionEntry(json);
//   const updatePermission = Convert.toUpdatePermission(json);
//   const deletePermissionEntry = Convert.toDeletePermissionEntry(json);
//   const deletePermission = Convert.toDeletePermission(json);
//   const computedField = Convert.toComputedField(json);
//   const computedFieldDefinition = Convert.toComputedFieldDefinition(json);
//   const eventTrigger = Convert.toEventTrigger(json);
//   const eventTriggerDefinition = Convert.toEventTriggerDefinition(json);
//   const eventTriggerColumns = Convert.toEventTriggerColumns(json);
//   const operationSpec = Convert.toOperationSpec(json);
//   const headerFromValue = Convert.toHeaderFromValue(json);
//   const headerFromEnv = Convert.toHeaderFromEnv(json);
//   const retryConf = Convert.toRetryConf(json);
//   const cronTrigger = Convert.toCronTrigger(json);
//   const retryConfST = Convert.toRetryConfST(json);
//   const remoteSchema = Convert.toRemoteSchema(json);
//   const remoteSchemaDef = Convert.toRemoteSchemaDef(json);
//   const remoteRelationship = Convert.toRemoteRelationship(json);
//   const remoteRelationshipDef = Convert.toRemoteRelationshipDef(json);
//   const remoteField = Convert.toRemoteField(json);
//   const inputArguments = Convert.toInputArguments(json);
//   const queryCollectionEntry = Convert.toQueryCollectionEntry(json);
//   const queryCollection = Convert.toQueryCollection(json);
//   const allowList = Convert.toAllowList(json);
//   const customTypes = Convert.toCustomTypes(json);
//   const inputObjectType = Convert.toInputObjectType(json);
//   const inputObjectField = Convert.toInputObjectField(json);
//   const objectType = Convert.toObjectType(json);
//   const objectField = Convert.toObjectField(json);
//   const customTypeObjectRelationship = Convert.toCustomTypeObjectRelationship(json);
//   const scalarType = Convert.toScalarType(json);
//   const enumType = Convert.toEnumType(json);
//   const enumValue = Convert.toEnumValue(json);
//   const action = Convert.toAction(json);
//   const actionDefinition = Convert.toActionDefinition(json);
//   const inputArgument = Convert.toInputArgument(json);
//   const hasuraMetadataV2 = Convert.toHasuraMetadataV2(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
Object.defineProperty(exports, "__esModule", { value: true });
var ActionDefinitionType;
(function (ActionDefinitionType) {
    ActionDefinitionType["Mutation"] = "mutation";
    ActionDefinitionType["Query"] = "query";
})(ActionDefinitionType = exports.ActionDefinitionType || (exports.ActionDefinitionType = {}));
/**
 * Type of the relationship
 */
var CustomTypeObjectRelationshipType;
(function (CustomTypeObjectRelationshipType) {
    CustomTypeObjectRelationshipType["Array"] = "array";
    CustomTypeObjectRelationshipType["Object"] = "object";
})(CustomTypeObjectRelationshipType = exports.CustomTypeObjectRelationshipType || (exports.CustomTypeObjectRelationshipType = {}));
var Columns;
(function (Columns) {
    Columns["Empty"] = "*";
})(Columns = exports.Columns || (exports.Columns = {}));
// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
class Convert {
    static toPGColumn(json) {
        return cast(JSON.parse(json), "");
    }
    static pGColumnToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toComputedFieldName(json) {
        return cast(JSON.parse(json), "");
    }
    static computedFieldNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toRoleName(json) {
        return cast(JSON.parse(json), "");
    }
    static roleNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toTriggerName(json) {
        return cast(JSON.parse(json), "");
    }
    static triggerNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toRemoteRelationshipName(json) {
        return cast(JSON.parse(json), "");
    }
    static remoteRelationshipNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toRemoteSchemaName(json) {
        return cast(JSON.parse(json), "");
    }
    static remoteSchemaNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toCollectionName(json) {
        return cast(JSON.parse(json), "");
    }
    static collectionNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toGraphQLName(json) {
        return cast(JSON.parse(json), "");
    }
    static graphQLNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toGraphQLType(json) {
        return cast(JSON.parse(json), "");
    }
    static graphQLTypeToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toRelationshipName(json) {
        return cast(JSON.parse(json), "");
    }
    static relationshipNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toActionName(json) {
        return cast(JSON.parse(json), "");
    }
    static actionNameToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toWebhookURL(json) {
        return cast(JSON.parse(json), "");
    }
    static webhookURLToJson(value) {
        return JSON.stringify(uncast(value, ""), null, 2);
    }
    static toTableName(json) {
        return cast(JSON.parse(json), u(r("QualifiedTable"), ""));
    }
    static tableNameToJson(value) {
        return JSON.stringify(uncast(value, u(r("QualifiedTable"), "")), null, 2);
    }
    static toQualifiedTable(json) {
        return cast(JSON.parse(json), r("QualifiedTable"));
    }
    static qualifiedTableToJson(value) {
        return JSON.stringify(uncast(value, r("QualifiedTable")), null, 2);
    }
    static toTableConfig(json) {
        return cast(JSON.parse(json), r("TableConfig"));
    }
    static tableConfigToJson(value) {
        return JSON.stringify(uncast(value, r("TableConfig")), null, 2);
    }
    static toTableEntry(json) {
        return cast(JSON.parse(json), r("TableEntry"));
    }
    static tableEntryToJson(value) {
        return JSON.stringify(uncast(value, r("TableEntry")), null, 2);
    }
    static toCustomRootFields(json) {
        return cast(JSON.parse(json), r("CustomRootFields"));
    }
    static customRootFieldsToJson(value) {
        return JSON.stringify(uncast(value, r("CustomRootFields")), null, 2);
    }
    static toCustomColumnNames(json) {
        return cast(JSON.parse(json), m(""));
    }
    static customColumnNamesToJson(value) {
        return JSON.stringify(uncast(value, m("")), null, 2);
    }
    static toFunctionName(json) {
        return cast(JSON.parse(json), u(r("QualifiedFunction"), ""));
    }
    static functionNameToJson(value) {
        return JSON.stringify(uncast(value, u(r("QualifiedFunction"), "")), null, 2);
    }
    static toQualifiedFunction(json) {
        return cast(JSON.parse(json), r("QualifiedFunction"));
    }
    static qualifiedFunctionToJson(value) {
        return JSON.stringify(uncast(value, r("QualifiedFunction")), null, 2);
    }
    static toCustomFunction(json) {
        return cast(JSON.parse(json), r("CustomFunction"));
    }
    static customFunctionToJson(value) {
        return JSON.stringify(uncast(value, r("CustomFunction")), null, 2);
    }
    static toFunctionConfiguration(json) {
        return cast(JSON.parse(json), r("FunctionConfiguration"));
    }
    static functionConfigurationToJson(value) {
        return JSON.stringify(uncast(value, r("FunctionConfiguration")), null, 2);
    }
    static toObjectRelationship(json) {
        return cast(JSON.parse(json), r("ObjectRelationship"));
    }
    static objectRelationshipToJson(value) {
        return JSON.stringify(uncast(value, r("ObjectRelationship")), null, 2);
    }
    static toObjRelUsing(json) {
        return cast(JSON.parse(json), r("ObjRelUsing"));
    }
    static objRelUsingToJson(value) {
        return JSON.stringify(uncast(value, r("ObjRelUsing")), null, 2);
    }
    static toObjRelUsingManualMapping(json) {
        return cast(JSON.parse(json), r("ObjRelUsingManualMapping"));
    }
    static objRelUsingManualMappingToJson(value) {
        return JSON.stringify(uncast(value, r("ObjRelUsingManualMapping")), null, 2);
    }
    static toArrayRelationship(json) {
        return cast(JSON.parse(json), r("ArrayRelationship"));
    }
    static arrayRelationshipToJson(value) {
        return JSON.stringify(uncast(value, r("ArrayRelationship")), null, 2);
    }
    static toArrRelUsing(json) {
        return cast(JSON.parse(json), r("ArrRelUsing"));
    }
    static arrRelUsingToJson(value) {
        return JSON.stringify(uncast(value, r("ArrRelUsing")), null, 2);
    }
    static toArrRelUsingFKeyOn(json) {
        return cast(JSON.parse(json), r("ArrRelUsingFKeyOn"));
    }
    static arrRelUsingFKeyOnToJson(value) {
        return JSON.stringify(uncast(value, r("ArrRelUsingFKeyOn")), null, 2);
    }
    static toArrRelUsingManualMapping(json) {
        return cast(JSON.parse(json), r("ArrRelUsingManualMapping"));
    }
    static arrRelUsingManualMappingToJson(value) {
        return JSON.stringify(uncast(value, r("ArrRelUsingManualMapping")), null, 2);
    }
    static toColumnPresetsExpression(json) {
        return cast(JSON.parse(json), m(""));
    }
    static columnPresetsExpressionToJson(value) {
        return JSON.stringify(uncast(value, m("")), null, 2);
    }
    static toInsertPermissionEntry(json) {
        return cast(JSON.parse(json), r("InsertPermissionEntry"));
    }
    static insertPermissionEntryToJson(value) {
        return JSON.stringify(uncast(value, r("InsertPermissionEntry")), null, 2);
    }
    static toInsertPermission(json) {
        return cast(JSON.parse(json), r("InsertPermission"));
    }
    static insertPermissionToJson(value) {
        return JSON.stringify(uncast(value, r("InsertPermission")), null, 2);
    }
    static toSelectPermissionEntry(json) {
        return cast(JSON.parse(json), r("SelectPermissionEntry"));
    }
    static selectPermissionEntryToJson(value) {
        return JSON.stringify(uncast(value, r("SelectPermissionEntry")), null, 2);
    }
    static toSelectPermission(json) {
        return cast(JSON.parse(json), r("SelectPermission"));
    }
    static selectPermissionToJson(value) {
        return JSON.stringify(uncast(value, r("SelectPermission")), null, 2);
    }
    static toUpdatePermissionEntry(json) {
        return cast(JSON.parse(json), r("UpdatePermissionEntry"));
    }
    static updatePermissionEntryToJson(value) {
        return JSON.stringify(uncast(value, r("UpdatePermissionEntry")), null, 2);
    }
    static toUpdatePermission(json) {
        return cast(JSON.parse(json), r("UpdatePermission"));
    }
    static updatePermissionToJson(value) {
        return JSON.stringify(uncast(value, r("UpdatePermission")), null, 2);
    }
    static toDeletePermissionEntry(json) {
        return cast(JSON.parse(json), r("DeletePermissionEntry"));
    }
    static deletePermissionEntryToJson(value) {
        return JSON.stringify(uncast(value, r("DeletePermissionEntry")), null, 2);
    }
    static toDeletePermission(json) {
        return cast(JSON.parse(json), r("DeletePermission"));
    }
    static deletePermissionToJson(value) {
        return JSON.stringify(uncast(value, r("DeletePermission")), null, 2);
    }
    static toComputedField(json) {
        return cast(JSON.parse(json), r("ComputedField"));
    }
    static computedFieldToJson(value) {
        return JSON.stringify(uncast(value, r("ComputedField")), null, 2);
    }
    static toComputedFieldDefinition(json) {
        return cast(JSON.parse(json), r("ComputedFieldDefinition"));
    }
    static computedFieldDefinitionToJson(value) {
        return JSON.stringify(uncast(value, r("ComputedFieldDefinition")), null, 2);
    }
    static toEventTrigger(json) {
        return cast(JSON.parse(json), r("EventTrigger"));
    }
    static eventTriggerToJson(value) {
        return JSON.stringify(uncast(value, r("EventTrigger")), null, 2);
    }
    static toEventTriggerDefinition(json) {
        return cast(JSON.parse(json), r("EventTriggerDefinition"));
    }
    static eventTriggerDefinitionToJson(value) {
        return JSON.stringify(uncast(value, r("EventTriggerDefinition")), null, 2);
    }
    static toEventTriggerColumns(json) {
        return cast(JSON.parse(json), u(a(""), r("Columns")));
    }
    static eventTriggerColumnsToJson(value) {
        return JSON.stringify(uncast(value, u(a(""), r("Columns"))), null, 2);
    }
    static toOperationSpec(json) {
        return cast(JSON.parse(json), r("OperationSpec"));
    }
    static operationSpecToJson(value) {
        return JSON.stringify(uncast(value, r("OperationSpec")), null, 2);
    }
    static toHeaderFromValue(json) {
        return cast(JSON.parse(json), r("HeaderFromValue"));
    }
    static headerFromValueToJson(value) {
        return JSON.stringify(uncast(value, r("HeaderFromValue")), null, 2);
    }
    static toHeaderFromEnv(json) {
        return cast(JSON.parse(json), r("HeaderFromEnv"));
    }
    static headerFromEnvToJson(value) {
        return JSON.stringify(uncast(value, r("HeaderFromEnv")), null, 2);
    }
    static toRetryConf(json) {
        return cast(JSON.parse(json), r("RetryConf"));
    }
    static retryConfToJson(value) {
        return JSON.stringify(uncast(value, r("RetryConf")), null, 2);
    }
    static toCronTrigger(json) {
        return cast(JSON.parse(json), r("CronTrigger"));
    }
    static cronTriggerToJson(value) {
        return JSON.stringify(uncast(value, r("CronTrigger")), null, 2);
    }
    static toRetryConfST(json) {
        return cast(JSON.parse(json), r("RetryConfST"));
    }
    static retryConfSTToJson(value) {
        return JSON.stringify(uncast(value, r("RetryConfST")), null, 2);
    }
    static toRemoteSchema(json) {
        return cast(JSON.parse(json), r("RemoteSchema"));
    }
    static remoteSchemaToJson(value) {
        return JSON.stringify(uncast(value, r("RemoteSchema")), null, 2);
    }
    static toRemoteSchemaDef(json) {
        return cast(JSON.parse(json), r("RemoteSchemaDef"));
    }
    static remoteSchemaDefToJson(value) {
        return JSON.stringify(uncast(value, r("RemoteSchemaDef")), null, 2);
    }
    static toRemoteRelationship(json) {
        return cast(JSON.parse(json), r("RemoteRelationship"));
    }
    static remoteRelationshipToJson(value) {
        return JSON.stringify(uncast(value, r("RemoteRelationship")), null, 2);
    }
    static toRemoteRelationshipDef(json) {
        return cast(JSON.parse(json), r("RemoteRelationshipDef"));
    }
    static remoteRelationshipDefToJson(value) {
        return JSON.stringify(uncast(value, r("RemoteRelationshipDef")), null, 2);
    }
    static toRemoteField(json) {
        return cast(JSON.parse(json), m(r("RemoteField")));
    }
    static remoteFieldToJson(value) {
        return JSON.stringify(uncast(value, m(r("RemoteField"))), null, 2);
    }
    static toInputArguments(json) {
        return cast(JSON.parse(json), m(""));
    }
    static inputArgumentsToJson(value) {
        return JSON.stringify(uncast(value, m("")), null, 2);
    }
    static toQueryCollectionEntry(json) {
        return cast(JSON.parse(json), r("QueryCollectionEntry"));
    }
    static queryCollectionEntryToJson(value) {
        return JSON.stringify(uncast(value, r("QueryCollectionEntry")), null, 2);
    }
    static toQueryCollection(json) {
        return cast(JSON.parse(json), r("QueryCollection"));
    }
    static queryCollectionToJson(value) {
        return JSON.stringify(uncast(value, r("QueryCollection")), null, 2);
    }
    static toAllowList(json) {
        return cast(JSON.parse(json), r("AllowList"));
    }
    static allowListToJson(value) {
        return JSON.stringify(uncast(value, r("AllowList")), null, 2);
    }
    static toCustomTypes(json) {
        return cast(JSON.parse(json), r("CustomTypes"));
    }
    static customTypesToJson(value) {
        return JSON.stringify(uncast(value, r("CustomTypes")), null, 2);
    }
    static toInputObjectType(json) {
        return cast(JSON.parse(json), r("InputObjectType"));
    }
    static inputObjectTypeToJson(value) {
        return JSON.stringify(uncast(value, r("InputObjectType")), null, 2);
    }
    static toInputObjectField(json) {
        return cast(JSON.parse(json), r("InputObjectField"));
    }
    static inputObjectFieldToJson(value) {
        return JSON.stringify(uncast(value, r("InputObjectField")), null, 2);
    }
    static toObjectType(json) {
        return cast(JSON.parse(json), r("ObjectType"));
    }
    static objectTypeToJson(value) {
        return JSON.stringify(uncast(value, r("ObjectType")), null, 2);
    }
    static toObjectField(json) {
        return cast(JSON.parse(json), r("ObjectField"));
    }
    static objectFieldToJson(value) {
        return JSON.stringify(uncast(value, r("ObjectField")), null, 2);
    }
    static toCustomTypeObjectRelationship(json) {
        return cast(JSON.parse(json), r("CustomTypeObjectRelationship"));
    }
    static customTypeObjectRelationshipToJson(value) {
        return JSON.stringify(uncast(value, r("CustomTypeObjectRelationship")), null, 2);
    }
    static toScalarType(json) {
        return cast(JSON.parse(json), r("ScalarType"));
    }
    static scalarTypeToJson(value) {
        return JSON.stringify(uncast(value, r("ScalarType")), null, 2);
    }
    static toEnumType(json) {
        return cast(JSON.parse(json), r("EnumType"));
    }
    static enumTypeToJson(value) {
        return JSON.stringify(uncast(value, r("EnumType")), null, 2);
    }
    static toEnumValue(json) {
        return cast(JSON.parse(json), r("EnumValue"));
    }
    static enumValueToJson(value) {
        return JSON.stringify(uncast(value, r("EnumValue")), null, 2);
    }
    static toAction(json) {
        return cast(JSON.parse(json), r("Action"));
    }
    static actionToJson(value) {
        return JSON.stringify(uncast(value, r("Action")), null, 2);
    }
    static toActionDefinition(json) {
        return cast(JSON.parse(json), r("ActionDefinition"));
    }
    static actionDefinitionToJson(value) {
        return JSON.stringify(uncast(value, r("ActionDefinition")), null, 2);
    }
    static toInputArgument(json) {
        return cast(JSON.parse(json), r("InputArgument"));
    }
    static inputArgumentToJson(value) {
        return JSON.stringify(uncast(value, r("InputArgument")), null, 2);
    }
    static toHasuraMetadataV2(json) {
        return cast(JSON.parse(json), r("HasuraMetadataV2"));
    }
    static hasuraMetadataV2ToJson(value) {
        return JSON.stringify(uncast(value, r("HasuraMetadataV2")), null, 2);
    }
}
exports.Convert = Convert;
function invalidValue(typ, val) {
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
}
function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}
function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}
function transform(val, typ, getProps) {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val)
            return val;
        return invalidValue(typ, val);
    }
    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            }
            catch (_) { }
        }
        return invalidValue(typs, val);
    }
    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1)
            return val;
        return invalidValue(cases, val);
    }
    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }
    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }
    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps);
            }
        });
        return result;
    }
    if (typ === "any")
        return val;
    if (typ === null) {
        if (val === null)
            return val;
        return invalidValue(typ, val);
    }
    if (typ === false)
        return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ))
        return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number")
        return transformDate(val);
    return transformPrimitive(typ, val);
}
function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}
function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}
function a(typ) {
    return { arrayItems: typ };
}
function u(...typs) {
    return { unionMembers: typs };
}
function o(props, additional) {
    return { props, additional };
}
function m(additional) {
    return { props: [], additional };
}
function r(name) {
    return { ref: name };
}
const typeMap = {
    "HeaderFromValue": o([
        { json: "name", js: "name", typ: "" },
        { json: "value", js: "value", typ: "" },
    ], "any"),
    "HeaderFromEnv": o([
        { json: "name", js: "name", typ: "" },
        { json: "value_from_env", js: "value_from_env", typ: "" },
    ], "any"),
    "ObjectField": o([
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], "any"),
    "HasuraMetadataV2": o([
        { json: "actions", js: "actions", typ: u(undefined, a(r("Action"))) },
        { json: "allowlist", js: "allowlist", typ: u(undefined, a(r("AllowList"))) },
        { json: "cron_triggers", js: "cron_triggers", typ: u(undefined, a(r("CronTrigger"))) },
        { json: "custom_types", js: "custom_types", typ: u(undefined, r("CustomTypes")) },
        { json: "functions", js: "functions", typ: u(undefined, a(r("CustomFunction"))) },
        { json: "query_collections", js: "query_collections", typ: u(undefined, a(r("QueryCollectionEntry"))) },
        { json: "remote_schemas", js: "remote_schemas", typ: u(undefined, a(r("RemoteSchema"))) },
        { json: "tables", js: "tables", typ: a(r("TableEntry")) },
        { json: "version", js: "version", typ: 3.14 },
    ], "any"),
    "Action": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "definition", js: "definition", typ: r("ActionDefinition") },
        { json: "name", js: "name", typ: "" },
        { json: "permissions", js: "permissions", typ: u(undefined, r("Permissions")) },
    ], "any"),
    "ActionDefinition": o([
        { json: "arguments", js: "arguments", typ: u(undefined, a(r("InputArgument"))) },
        { json: "forward_client_headers", js: "forward_client_headers", typ: u(undefined, true) },
        { json: "handler", js: "handler", typ: "" },
        { json: "headers", js: "headers", typ: u(undefined, a(r("Header"))) },
        { json: "kind", js: "kind", typ: u(undefined, "") },
        { json: "output_type", js: "output_type", typ: u(undefined, "") },
        { json: "type", js: "type", typ: u(undefined, r("ActionDefinitionType")) },
    ], "any"),
    "InputArgument": o([
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], "any"),
    "Header": o([
        { json: "name", js: "name", typ: "" },
        { json: "value", js: "value", typ: u(undefined, "") },
        { json: "value_from_env", js: "value_from_env", typ: u(undefined, "") },
    ], "any"),
    "Permissions": o([
        { json: "role", js: "role", typ: "" },
    ], "any"),
    "AllowList": o([
        { json: "collection", js: "collection", typ: "" },
    ], "any"),
    "CronTrigger": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "headers", js: "headers", typ: a(r("Header")) },
        { json: "include_in_metadata", js: "include_in_metadata", typ: true },
        { json: "name", js: "name", typ: "" },
        { json: "payload", js: "payload", typ: u(undefined, m("any")) },
        { json: "retry_conf", js: "retry_conf", typ: u(undefined, r("RetryConfST")) },
        { json: "schedule", js: "schedule", typ: "" },
        { json: "webhook", js: "webhook", typ: "" },
    ], "any"),
    "RetryConfST": o([
        { json: "num_retries", js: "num_retries", typ: u(undefined, 0) },
        { json: "retry_interval_seconds", js: "retry_interval_seconds", typ: u(undefined, 0) },
        { json: "timeout_seconds", js: "timeout_seconds", typ: u(undefined, 0) },
        { json: "tolerance_seconds", js: "tolerance_seconds", typ: u(undefined, 0) },
    ], "any"),
    "CustomTypes": o([
        { json: "enums", js: "enums", typ: u(undefined, a(r("EnumType"))) },
        { json: "input_objects", js: "input_objects", typ: u(undefined, a(r("InputObjectType"))) },
        { json: "objects", js: "objects", typ: u(undefined, a(r("ObjectType"))) },
        { json: "scalars", js: "scalars", typ: u(undefined, a(r("ScalarType"))) },
    ], "any"),
    "EnumType": o([
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
        { json: "values", js: "values", typ: a(r("EnumValue")) },
    ], "any"),
    "EnumValue": o([
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "is_deprecated", js: "is_deprecated", typ: u(undefined, true) },
        { json: "value", js: "value", typ: "" },
    ], "any"),
    "InputObjectType": o([
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "fields", js: "fields", typ: a(r("InputObjectField")) },
        { json: "name", js: "name", typ: "" },
    ], "any"),
    "InputObjectField": o([
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], "any"),
    "ObjectType": o([
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "fields", js: "fields", typ: a(r("InputObjectField")) },
        { json: "name", js: "name", typ: "" },
        { json: "relationships", js: "relationships", typ: u(undefined, a(r("CustomTypeObjectRelationship"))) },
    ], "any"),
    "CustomTypeObjectRelationship": o([
        { json: "field_mapping", js: "field_mapping", typ: m("") },
        { json: "name", js: "name", typ: "" },
        { json: "remote_table", js: "remote_table", typ: u(r("QualifiedTable"), "") },
        { json: "type", js: "type", typ: r("CustomTypeObjectRelationshipType") },
    ], "any"),
    "QualifiedTable": o([
        { json: "name", js: "name", typ: "" },
        { json: "schema", js: "schema", typ: "" },
    ], "any"),
    "ScalarType": o([
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
    ], "any"),
    "CustomFunction": o([
        { json: "configuration", js: "configuration", typ: u(undefined, r("FunctionConfiguration")) },
        { json: "function", js: "function", typ: u(r("QualifiedFunction"), "") },
    ], "any"),
    "FunctionConfiguration": o([
        { json: "session_argument", js: "session_argument", typ: u(undefined, "") },
    ], "any"),
    "QualifiedFunction": o([
        { json: "name", js: "name", typ: "" },
        { json: "schema", js: "schema", typ: "" },
    ], "any"),
    "QueryCollectionEntry": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "definition", js: "definition", typ: r("Definition") },
        { json: "name", js: "name", typ: "" },
    ], "any"),
    "Definition": o([
        { json: "queries", js: "queries", typ: a(r("QueryCollection")) },
    ], "any"),
    "QueryCollection": o([
        { json: "name", js: "name", typ: "" },
        { json: "query", js: "query", typ: "" },
    ], "any"),
    "RemoteSchema": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "definition", js: "definition", typ: r("RemoteSchemaDef") },
        { json: "name", js: "name", typ: "" },
    ], "any"),
    "RemoteSchemaDef": o([
        { json: "forward_client_headers", js: "forward_client_headers", typ: u(undefined, true) },
        { json: "headers", js: "headers", typ: u(undefined, a(r("Header"))) },
        { json: "timeout_seconds", js: "timeout_seconds", typ: u(undefined, 3.14) },
        { json: "url", js: "url", typ: u(undefined, "") },
        { json: "url_from_env", js: "url_from_env", typ: u(undefined, "") },
    ], "any"),
    "TableEntry": o([
        { json: "array_relationships", js: "array_relationships", typ: u(undefined, a(r("ArrayRelationship"))) },
        { json: "computed_fields", js: "computed_fields", typ: u(undefined, a(r("ComputedField"))) },
        { json: "configuration", js: "configuration", typ: u(undefined, r("TableConfig")) },
        { json: "delete_permissions", js: "delete_permissions", typ: u(undefined, a(r("DeletePermissionEntry"))) },
        { json: "event_triggers", js: "event_triggers", typ: u(undefined, a(r("EventTrigger"))) },
        { json: "insert_permissions", js: "insert_permissions", typ: u(undefined, a(r("InsertPermissionEntry"))) },
        { json: "is_enum", js: "is_enum", typ: u(undefined, true) },
        { json: "object_relationships", js: "object_relationships", typ: u(undefined, a(r("ObjectRelationship"))) },
        { json: "remote_relationships", js: "remote_relationships", typ: u(undefined, a(r("RemoteRelationship"))) },
        { json: "select_permissions", js: "select_permissions", typ: u(undefined, a(r("SelectPermissionEntry"))) },
        { json: "table", js: "table", typ: r("QualifiedTable") },
        { json: "update_permissions", js: "update_permissions", typ: u(undefined, a(r("UpdatePermissionEntry"))) },
    ], "any"),
    "ArrayRelationship": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
        { json: "using", js: "using", typ: r("ArrRelUsing") },
    ], "any"),
    "ArrRelUsing": o([
        { json: "foreign_key_constraint_on", js: "foreign_key_constraint_on", typ: u(undefined, r("ArrRelUsingFKeyOn")) },
        { json: "manual_configuration", js: "manual_configuration", typ: u(undefined, r("ArrRelUsingManualMapping")) },
    ], "any"),
    "ArrRelUsingFKeyOn": o([
        { json: "column", js: "column", typ: "" },
        { json: "table", js: "table", typ: u(r("QualifiedTable"), "") },
    ], "any"),
    "ArrRelUsingManualMapping": o([
        { json: "column_mapping", js: "column_mapping", typ: m("") },
        { json: "remote_table", js: "remote_table", typ: u(r("QualifiedTable"), "") },
    ], "any"),
    "ComputedField": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "definition", js: "definition", typ: r("ComputedFieldDefinition") },
        { json: "name", js: "name", typ: "" },
    ], "any"),
    "ComputedFieldDefinition": o([
        { json: "function", js: "function", typ: u(r("QualifiedFunction"), "") },
        { json: "session_argument", js: "session_argument", typ: u(undefined, "") },
        { json: "table_argument", js: "table_argument", typ: u(undefined, "") },
    ], "any"),
    "TableConfig": o([
        { json: "custom_column_names", js: "custom_column_names", typ: u(undefined, m("")) },
        { json: "custom_root_fields", js: "custom_root_fields", typ: u(undefined, r("CustomRootFields")) },
    ], "any"),
    "CustomRootFields": o([
        { json: "delete", js: "delete", typ: u(undefined, "") },
        { json: "delete_by_pk", js: "delete_by_pk", typ: u(undefined, "") },
        { json: "insert", js: "insert", typ: u(undefined, "") },
        { json: "insert_one", js: "insert_one", typ: u(undefined, "") },
        { json: "select", js: "select", typ: u(undefined, "") },
        { json: "select_aggregate", js: "select_aggregate", typ: u(undefined, "") },
        { json: "select_by_pk", js: "select_by_pk", typ: u(undefined, "") },
        { json: "update", js: "update", typ: u(undefined, "") },
        { json: "update_by_pk", js: "update_by_pk", typ: u(undefined, "") },
    ], "any"),
    "DeletePermissionEntry": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "permission", js: "permission", typ: r("DeletePermission") },
        { json: "role", js: "role", typ: "" },
    ], "any"),
    "DeletePermission": o([
        { json: "filter", js: "filter", typ: u(undefined, m(u(3.14, m("any"), ""))) },
    ], "any"),
    "EventTrigger": o([
        { json: "definition", js: "definition", typ: r("EventTriggerDefinition") },
        { json: "headers", js: "headers", typ: u(undefined, a(r("Header"))) },
        { json: "name", js: "name", typ: "" },
        { json: "retry_conf", js: "retry_conf", typ: r("RetryConf") },
        { json: "webhook", js: "webhook", typ: u(undefined, "") },
        { json: "webhook_from_env", js: "webhook_from_env", typ: u(undefined, "") },
    ], "any"),
    "EventTriggerDefinition": o([
        { json: "delete", js: "delete", typ: u(undefined, r("OperationSpec")) },
        { json: "enable_manual", js: "enable_manual", typ: true },
        { json: "insert", js: "insert", typ: u(undefined, r("OperationSpec")) },
        { json: "update", js: "update", typ: u(undefined, r("OperationSpec")) },
    ], "any"),
    "OperationSpec": o([
        { json: "columns", js: "columns", typ: u(a(""), r("Columns")) },
        { json: "payload", js: "payload", typ: u(undefined, u(a(""), r("Columns"))) },
    ], "any"),
    "RetryConf": o([
        { json: "interval_sec", js: "interval_sec", typ: u(undefined, 0) },
        { json: "num_retries", js: "num_retries", typ: u(undefined, 0) },
        { json: "timeout_sec", js: "timeout_sec", typ: u(undefined, 0) },
    ], "any"),
    "InsertPermissionEntry": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "permission", js: "permission", typ: r("InsertPermission") },
        { json: "role", js: "role", typ: "" },
    ], "any"),
    "InsertPermission": o([
        { json: "backend_only", js: "backend_only", typ: u(undefined, true) },
        { json: "check", js: "check", typ: u(undefined, m(u(3.14, m("any"), ""))) },
        { json: "columns", js: "columns", typ: u(a(""), r("Columns")) },
        { json: "set", js: "set", typ: u(undefined, m("")) },
    ], "any"),
    "ObjectRelationship": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
        { json: "using", js: "using", typ: r("ObjRelUsing") },
    ], "any"),
    "ObjRelUsing": o([
        { json: "foreign_key_constraint_on", js: "foreign_key_constraint_on", typ: u(undefined, "") },
        { json: "manual_configuration", js: "manual_configuration", typ: u(undefined, r("ObjRelUsingManualMapping")) },
    ], "any"),
    "ObjRelUsingManualMapping": o([
        { json: "column_mapping", js: "column_mapping", typ: m("") },
        { json: "remote_table", js: "remote_table", typ: u(r("QualifiedTable"), "") },
    ], "any"),
    "RemoteRelationship": o([
        { json: "definition", js: "definition", typ: r("RemoteRelationshipDef") },
        { json: "name", js: "name", typ: "" },
    ], "any"),
    "RemoteRelationshipDef": o([
        { json: "hasura_fields", js: "hasura_fields", typ: a("") },
        { json: "remote_field", js: "remote_field", typ: m(r("RemoteField")) },
        { json: "remote_schema", js: "remote_schema", typ: "" },
    ], "any"),
    "RemoteField": o([
        { json: "arguments", js: "arguments", typ: m("") },
        { json: "field", js: "field", typ: u(undefined, m(r("RemoteField"))) },
    ], "any"),
    "SelectPermissionEntry": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "permission", js: "permission", typ: r("SelectPermission") },
        { json: "role", js: "role", typ: "" },
    ], "any"),
    "SelectPermission": o([
        { json: "allow_aggregations", js: "allow_aggregations", typ: u(undefined, true) },
        { json: "columns", js: "columns", typ: u(a(""), r("Columns")) },
        { json: "computed_fields", js: "computed_fields", typ: u(undefined, a("")) },
        { json: "filter", js: "filter", typ: u(undefined, m(u(3.14, m("any"), ""))) },
        { json: "limit", js: "limit", typ: u(undefined, 0) },
    ], "any"),
    "UpdatePermissionEntry": o([
        { json: "comment", js: "comment", typ: u(undefined, "") },
        { json: "permission", js: "permission", typ: r("UpdatePermission") },
        { json: "role", js: "role", typ: "" },
    ], "any"),
    "UpdatePermission": o([
        { json: "check", js: "check", typ: u(undefined, m(u(3.14, m("any"), ""))) },
        { json: "columns", js: "columns", typ: u(a(""), r("Columns")) },
        { json: "filter", js: "filter", typ: u(undefined, m(u(3.14, m("any"), ""))) },
        { json: "set", js: "set", typ: u(undefined, m("")) },
    ], "any"),
    "ActionDefinitionType": [
        "mutation",
        "query",
    ],
    "CustomTypeObjectRelationshipType": [
        "array",
        "object",
    ],
    "Columns": [
        "*",
    ],
};
