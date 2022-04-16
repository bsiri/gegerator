

/*
    Theater : the instances of Theater in Gerardmer.
    They should match the Theater class 
    from the java model.

    Could have been enums, but they prove difficult to 
    work with in Angular templates, and I found using 
    this construct to be easier to manage.
*/

export interface Theater{
    key: string, 
    name: string
}

export class Theaters{
    static ESPACE_LAC: Theater = {key: "ESPACE_LAC", name: "Espace Lac"};
    static CASINO: Theater = {key: "CASINO", name: "Casino"};
    static PARADISO: Theater = {key: "PARADISO", name: "Paradiso"};
    static MCL: Theater = {key: "MCL", name: "MCL"};

    static enumerate(): Theater[]{
        return [this.ESPACE_LAC, this.CASINO, this.PARADISO, this.MCL];
    }

    static fromKey(key: string): Theater{
        const found = Theaters.enumerate().find(t => t.key == key)
        if (!found){
            throw Error(`Programmatic error : unknown theater ${key} !`)
        }
        return found;
    }
}


/*
    Same thing with days.
*/
export interface Day{
    key: string, 
    name: string
}

export class Days{
    static THURSDAY: Day = { key: "THURSDAY", name: "Jeudi"};
    static FRIDAY: Day = { key: "FRIDAY", name: "Vendredi"};
    static SATURDAY: Day = { key: "SATURDAY", name: "Samedi"};
    static SUNDAY: Day = { key: "SUNDAY", name: "Dimanche"};

    static enumerate(): Day[]{
        return [this.THURSDAY, this.FRIDAY, this.SATURDAY, this.SUNDAY];
    }

    static fromKey(key: string): Day{
        const found = Days.enumerate().find(t => t.key == key)
        if (!found){
            throw Error(`Programmatic error : unknown day ${key} !`)
        }
        return found;
    }
}



