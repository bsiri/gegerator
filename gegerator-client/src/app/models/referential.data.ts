/*
    Theater : the instances of Theater in Gerardmer.
    They should match the Theater class 
    from the java model.

    Could have been enums, but they prove difficult to 
    work with when passed around as Template inputs, 
    thus this form is more convenient.
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
        switch(key){
            case this.ESPACE_LAC.key: {
                return this.ESPACE_LAC;
                break;
            }
            case this.CASINO.key: {
                return this.CASINO;
                break;
            }
            case this.PARADISO.key: {
                return this.PARADISO;
                break;
            }
            case this.MCL.key: {
                return this.MCL;
                break;
            }
            default: {
                const msg = `Cinéma inconnu : ${key} !!`
                alert(msg);
                throw Error(msg)
            }
        }
    }
}


/*
    Same thing with days.
*/
export interface Day{
    key: String, 
    name: String
}

export class Days{
    static THURSDAY: Day = { key: "THURSDAY", name: "Jeudi"};
    static FRIDAY: Day = { key: "FRIDAY", name: "Vendredi"};
    static SATURDAY: Day = { key: "SATURDAY", name: "Samedi"};
    static SUNDAY: Day = { key: "SUNDAY", name: "Dimanche"};

    static enumerate(): Day[]{
        return [this.THURSDAY, this.FRIDAY, this.SATURDAY, this.SUNDAY];
    }
}




