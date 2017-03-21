type ParseResult<T> =
    { success: true, value: T } |
    { success: false, justification: string };

function parseSuccess<T>(value: T): ParseResult<T> {
    return { success: true, value: value };
}

function parseFailure<T>(justification: string): ParseResult<T> {
    return { success: false, justification: justification };
}

type Type = "number" | "string" | "boolean" | "array";

function itemIsType(o: any, expectedType: Type): boolean {
    return ({}).toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == expectedType;
}

function getObjectValue(o: any, key: string, expectedType: Type, allowNull: boolean): any {
    if (itemIsType(o[key], expectedType)) {
        return o[key];
    } else if (allowNull) {
        return null;
    } else {
        throw TypeError(`key '${key}' is (${o[key]}): ${typeof o[key]}, expected ${expectedType}`);
    }
}

function getString(o: any, key: string): string {
    return getObjectValue(o, key, "string", false)
}

function getStringOrNull(o: any, key: string): string | null {
    return getObjectValue(o, key, "string", true)
}

function getNumber(o: any, key: string): number {
    return getObjectValue(o, key, "number", false)
}

function getNumberOrNull(o: any, key: string): number | null {
    return getObjectValue(o, key, "number", true)
}

function getBoolean(o: any, key: string): boolean {
    return getObjectValue(o, key, "boolean", false)
}

function getBooleanOrNull(o: any, key: string): boolean | null {
    return getObjectValue(o, key, "boolean", true)
}

function getArray(o: any, key: string): any[] {
    return getObjectValue(o, key, "array", false)
}

function getArrayOrNull(o: any, key: string): any[] | null {
    return getObjectValue(o, key, "array", true)
}

function getSubobject<T>(o: any, key: string, parseFunction: (o: any) => ParseResult<T>): T {
    const result = parseFunction(o[key]);
    if (result.success) {
        return result.value;
    } else {
        throw TypeError(`Invalid subobject at key '${key}': ${result.justification}`);
    }
}

function getSubobjectOrNull<T>(o: any, key: string, parseFunction: (o: any) => ParseResult<T>): T | null {
    const result = parseFunction(o[key]);
    return result.success ? result.value : null;
}

function getArrayOfSubobjects<T>(o: any, key: string, parseFunction: (o: any) => ParseResult<T>, failBehavior: "ignore" | "warn" | "throw"): T[] {
    return (getArrayOrNull(o, key) || [])
        .map(elem => {
            const result = parseFunction(elem);
            if (result.success) {
                return result.value;
            } else {
                if (failBehavior == "throw") {
                    throw TypeError(`Invalid subobject: ${result.justification}`);
                } else {
                    if (failBehavior == "warn") {
                        console.warn(`Ignoring invalid subobject: ${result.justification}`);
                    }
                    return null;
                }
            }
        })
        .filter(Boolean) as T[];
}

class Address {
    constructor(public streetNumber: number,
        public streetName: string,
        public isCommercial: boolean) { }

    public fullAddress(): string {
        return `${this.isCommercial ? "(C)" : "(R)"} ${this.streetNumber} ${this.streetName}`;
    }

    static parse(o: any): ParseResult<Address> {
        try {
            return parseSuccess(new Address(
                getNumber(o, "streetNumber"),
                getString(o, "streetName"),
                getBoolean(o, "isComm")
            ));
        } catch (e) {
            return parseFailure<Address>(`Invalid Address: ${e.message}`);
        }
    }
}

class Person {
    constructor(public name: string,
        public age: number | null,
        public primaryAddress: Address,
        public addresses: Address[]) { }

    static parse(o: any): ParseResult<Person> {
        try {
            return parseSuccess(new Person(
                getStringOrNull(o, "name") || "John Doe",
                getNumber(o, "age"),
                getSubobject(o, "primaryAddress", Address.parse),
                getArrayOfSubobjects(o, "addresses", Address.parse, "warn"),
            ));
        } catch (e) {
            return parseFailure<Person>(`Invalid Person: ${e.message}`);
        }
    }

    public greet(): string {
        const addresses = this.addresses.map(a => a.fullAddress()).join(", ");
        return `Hello ${this.name}, you are ${this.age} year(s) old and you live at ${this.primaryAddress.fullAddress()} and also sometimes ${addresses}`;
    }
}

let apiResp = {
    age: 22,
    name: "Nic",
    primaryAddress: {
        streetNumber: 40,
        streetName: "Lilac Dr",
        isComm: false,
    },
    addresses: [
        {
            streetNumber: 120,
            streetName: "East Ave",
            isComm: true,
        },
        {
            streetNumber: 3762,
            streetName: "Colliers Dr",
            isComm: false,
        },
    ],
};

let p = Person.parse(apiResp);

let text = document.createElement("p");

if (p.success) {
    text.textContent = p.value.greet();
    text.style.color = "green";
} else {
    text.textContent = p.justification;
    text.style.color = "red";
}

document.body.appendChild(text);
