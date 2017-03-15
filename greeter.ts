class ParseError {
    kind: "ParseError" = "ParseError";
    constructor(public justification: string) {}
}

type Type = "number" | "string" | "boolean";

function checkType(o: any,
    key: string,
    expectedType: Type,
): any {
    if (typeof o[key] == expectedType) {
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
        public address: Address) { }

    static parse(o: any): Person | ParseError {
        try {
            let name = checkType(o, "name", "string");
            let age = checkType(o, "age", "number");
            let addressResult = Address.parse(o["address"])
            var address = (() => {
                switch (addressResult.kind) {
                    case "Address":
                        return addressResult
                    case "ParseError":
                        throw TypeError(addressResult.justification);
                }
            })();
            return new Person(name, age, address);
        } catch (e) {
            return new ParseError("Invalid Person: " + (e as Error).message);
        }
    }

    public greet(): string {
        return `Hello ${this.name}, you are ${this.age} year(s) old and you live at ${this.address.fullAddress()}`;
    }
}

let apiResp = {
    age: 22,
    name: "Nic",
    address: {
        streetNumber: 120,
        streetName: "East Ave",
        isComm: "true"
    }
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
