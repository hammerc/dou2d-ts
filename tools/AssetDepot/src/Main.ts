import { Depot } from "./app/Depot";
import { Publish } from "./app/Publish";

class Main {
    public constructor() {
        let args = process.argv.splice(2);

        switch (args[0]) {
            case "depot":
                new Depot()
                    .start(args[1], args[2])
                    .catch((reason) => {
                        console.error(reason);
                    });
                break;
            case "publish":
                new Publish()
                    .start(args[1], args[2], <any>args[3], args[4])
                    .catch((reason) => {
                        console.error(reason);
                    });
                break;
        }
    }
}

new Main();
