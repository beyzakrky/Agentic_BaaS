// To collect metadata
import "reflect-metadata";

const ENTITY_METADATA_KEY = "custom:entities";

export interface ColumnMetadata {
    propertyKey: string;
    type: 'text' | 'boolean' | 'date';
    required: boolean;
}

export function entity(tabelName: string) {
    return function (target: Function) {
        Reflect.defineMetadata("tableName", tabelName, target);

        // Save in Global entity table 
        const globalEntities = Reflect.getMetadata(ENTITY_METADATA_KEY, global) || [];
        globalEntities.push(target);
        Reflect.defineMetadata(ENTITY_METADATA_KEY, globalEntities, global);
    };
}

function addColumnMetadata(target: any, propertyKey: string, type: 'text' | 'boolean' | 'date', options?: { required?: boolean }) {
    const columns: ColumnMetadata[] = Reflect.getMetadata("columns", target.constructor) || [];
    columns.push({
        propertyKey,
        type,
        required: options?.required || false
    });
    Reflect.defineMetadata("columns", columns, target.constructor);
}

export function text(options?: { required?: boolean}) {
    return (target: any, propertyKey: string) => addColumnMetadata(target, propertyKey, 'text', options);
}

export function boolean() {
    return (target: any, propertyKey: string) => addColumnMetadata(target, propertyKey, 'boolean');
}

export function date(){
    return (target: any, propoertyKey: string) => addColumnMetadata(target, propoertyKey, 'date');
}

export function getRegisteredEntities(): Function[] {
    return Reflect.getMetadata(ENTITY_METADATA_KEY, global) || [];
}
