class ParseError {
    kind: "ParseError" = "ParseError";
    constructor(public justification: string) {}
}

type Type = "number" | "string" | "boolean" | "array";

function checkType(o: any,
    key: string,
    expectedType: Type,
): any {
    if (typeof o[key] == expectedType ||
        (expectedType == "array" && Array.isArray(o[key]))) {
        return o[key];
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
        return `${this.isCommercial ? "(C)" : "(R)"} ${this.streetNumber} ${this.streetName}`
    }

    static parse(o: any): Address | ParseError {
        try {
            let streetNumber = checkType(o, "streetNumber", "number")
            let streetName = checkType(o, "streetName", "string")
            let isCommercial = checkType(o, "isComm", "boolean")
            return new Address(streetNumber, streetName, isCommercial)
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
                checkType(o, "name", "string"),
                checkType(o, "age", "number"),
                (() => {
                    return checkType(o, "addresses", "array").map(addressObject => {
                        const addressResult = Address.parse(addressObject)
                        switch (addressResult.kind) {
                            case "Address":
                                return addressResult
                            case "ParseError":
                                // Return `null` to filter or throw to abort the entire Person
                                console.log("Ignoring bad address: " + addressResult.justification);
                                return null
                        }
                    }).filter(a => a != null)
                })()
            );
        } catch (e) {
            return new ParseError("Invalid Person: " + (e as Error).message);
        }
    }

    public greet(): string {
        const addresses = this.addresses.map(a => a.fullAddress()).join(", ")
        console.log(addresses)
        return `Hello ${this.name}, you are ${this.age} year(s) old and you live at ${addresses}`
    }
}

let apiResp = {
    age: 22,
    name: "Nic",
    addresses: [
        {
            streetNumber: 120,
            streetName: "East Ave",
            isComm: true
        },
        {
            streetNumber: 40,
            streetName: "Lilac Dr",
            isComm: false
        }
    ]
};

let p = Person.parse(apiResp);

let text = document.createElement('p');

text.textContent = (() => {
    switch (p.kind) {
        case "Person":
            return p.greet();
        case "ParseError":
            return p.justification;
    }
})();

document.body.appendChild(text);
