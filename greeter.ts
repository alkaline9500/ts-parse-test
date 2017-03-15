class ParseError {
    kind: "ParseError" = "ParseError";
    constructor(public justification: string) {}
}

type Type = "number" | "string" | "boolean" | "array";

function itemIsType(o: any, expectedType: Type): boolean {
    return typeof o == expectedType || (expectedType == "array" && Array.isArray(o));
}

function getObjectValue(o: any, key: string, expectedType: Type, defaultValue?: any): any {
    if (itemIsType(o[key], expectedType)) {
        return o[key];
    } else if (defaultValue != undefined) {
        if (!itemIsType(defaultValue, expectedType)) {
            throw TypeError(`default value is (${defaultValue}): ${typeof defaultValue}, expected ${expectedType}`);
        }
        return defaultValue;
    } else {
        throw TypeError(`key '${key}' is (${o[key]}): ${typeof o[key]}, expected ${expectedType}`);
    }
}

class Address {
    kind: "Address" = "Address";
    constructor(public streetNumber: number,
        public streetName: string,
        public isCommercial: boolean) { }

    public fullAddress(): string {
        return `${this.isCommercial ? "(C)" : "(R)"} ${this.streetNumber} ${this.streetName}`;
    }

    static parse(o: any): Address | ParseError {
        try {
            const streetNumber = getObjectValue(o, "streetNumber", "number");
            const streetName = getObjectValue(o, "streetName", "string");
            const isCommercial = getObjectValue(o, "isComm", "boolean");
            return new Address(streetNumber, streetName, isCommercial);
        } catch (e) {
            return new ParseError("Invalid Address: " + (e as Error).message);
        }
    }
}

class Person {
    kind: "Person" = "Person";

    constructor(public name: string,
        public age: number,
        public addresses: Address[]) { }

    static parse(o: any): Person | ParseError {
        try {
            return new Person(
                getObjectValue(o, "name", "string", "John Doe"),
                getObjectValue(o, "age", "number"),
                (() => {
                    return getObjectValue(o, "addresses", "array").map((addressObject: any) => {
                        const addressResult = Address.parse(addressObject);
                        switch (addressResult.kind) {
                            case "Address":
                                return addressResult;
                            case "ParseError":
                                // Return `null` to filter or throw to abort the entire Person
                                console.log("Ignoring bad address: " + addressResult.justification);
                                return null;
                        }
                    }).filter((a: Address | null) => a != null);
                })(),
            );
        } catch (e) {
            return new ParseError("Invalid Person: " + (e as Error).message);
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

text.textContent = (() => {
    switch (p.kind) {
        case "Person":
            return p.greet();
        case "ParseError":
            return p.justification;
    }
})();

document.body.appendChild(text);
