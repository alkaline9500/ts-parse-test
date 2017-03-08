class Success<T> {
    kind: "success";
    contents: T;

    constructor(contents) {
        this.contents = contents;
    }
}

class Failure<T> {
    kind: "failure";
    justification: string;

    constructor(justification: string) {
        this.justification = justification
    }
}

type ParseResult<T> = Success<T> | Failure<T>;

class Person {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    static parse(o: any): ParseResult<Person> {
        // TODO: verify types and fail with justifications
        // if (typeof(o.name) == "string") return new Failure<Person>("Person missing `name`")
        // if (typeof(o.age) == "number") return new Failure<Person>("Person missing `number`")
        return new Success<Person>(new Person(o.name, o.age));
    }

    public greet(): string {
        return `Hello ${this.name}, you are ${this.age} year(s) old`;
    }
}

let apiResp = {
    age: 22,
    name: "Nic"
};
let p: ParseResult<Person> = Person.parse(apiResp)

let text = document.createElement('p');

switch (p.kind) {
    case "success":
        text.textContent = p.contents.greet();
        break;
    case "failure":
        text.textContent = p.justification;
        break;
    default:
        text.textContent = "bad case: ";
}
document.body.appendChild(text);
