type ParseResult<T> =
    { success: true, value: T } |
    { success: false, justification: string };

type Type = "number" | "string" | "boolean" | "object" | "array";

function itemIsType(o: any, expectedType: Type): boolean {
    return ({}).toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == expectedType;
}

function getObjectValue(o: any, key: string, expectedType: Type, defaultValue?: any): any {
    if (itemIsType(o[key], expectedType)) {
        return o[key];
    } else if (defaultValue != undefined) {
        if (!itemIsType(defaultValue, expectedType)) {
            throw TypeError(`default value for key '${key}' is (${defaultValue}): ${typeof defaultValue}, expected ${expectedType}`);
        }
        return defaultValue;
    } else {
        throw TypeError(`key '${key}' is (${o[key]}): ${typeof o[key]}, expected ${expectedType}`);
    }
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
            const streetNumber = getObjectValue(o, "streetNumber", "number");
            const streetName = getObjectValue(o, "streetName", "string");
            const isCommercial = getObjectValue(o, "isComm", "boolean");
            return { success: true, value: new Address(streetNumber, streetName, isCommercial) };
        } catch (e) {
            return { success: false, justification: "Invalid Address: " + e.message };
        }
    }
}

class Person {
    constructor(public name: string,
        public age: number,
        public addresses: Address[]) { }

    static parse(o: any): ParseResult<Person> {
        try {
            return {
                success: true,
                value: new Person(
                    getObjectValue(o, "name", "string", "John Doe"),
                    getObjectValue(o, "age", "number"),
                    getObjectValue(o, "addresses", "array")
                        .map((addressObject: any) => {
                            const addressResult = Address.parse(addressObject);
                            // Return `null` to filter or throw to abort the entire Person
                            return addressResult.success ? addressResult.value : null;
                        })
                        .filter((a: Address | null) => a != null),
                ),
            };
        } catch (e) {
            return { success: false, justification: "Invalid Person: " + e.message };
        }
    }

    public greet(): string {
        const addresses = this.addresses.map(a => a.fullAddress()).join(", ");
        return `Hello ${this.name}, you are ${this.age} year(s) old and you live at ${addresses}`;
    }
}

let apiResp = {
    age: 22,
    name: "Nic",
    addresses: [
        {
            streetNumber: 120,
            streetName: "East Ave",
            isComm: true,
        },
        {
            streetNumber: 40,
            streetName: "Lilac Dr",
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
