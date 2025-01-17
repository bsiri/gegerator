import { Comparable } from "../../models/comparable.interface";


export class WizardConfiguration{
    constructor(
        public espaceLacRating: TheaterRating = TheaterRatings.DEFAULT,
        public casinoRating: TheaterRating = TheaterRatings.DEFAULT, 
        public paradisoRating: TheaterRating = TheaterRatings.DEFAULT,
        public mclRating: TheaterRating = TheaterRatings.DEFAULT,
        public movieVsTheaterBias: number = 0.5
    ){}
    
    toJSON(): WizardConfigurationJSON{
        return {
            espaceLacRating: this.espaceLacRating.key,
            casinoRating: this.casinoRating.key,
            paradisoRating: this.paradisoRating.key,
            mclRating: this.mclRating.key,
            movieVsTheaterBias: this.movieVsTheaterBias
        }
    }

    static fromJSON(json: WizardConfigurationJSON): WizardConfiguration{
        return new WizardConfiguration(
            TheaterRatings.fromKey(json.espaceLacRating),
            TheaterRatings.fromKey(json.casinoRating),
            TheaterRatings.fromKey(json.paradisoRating),
            TheaterRatings.fromKey(json.mclRating),
            json.movieVsTheaterBias
        )
    }

    copy(modifiers = {}): WizardConfiguration{
      const _clone = new WizardConfiguration(
        this.espaceLacRating, 
        this.casinoRating, 
        this.paradisoRating, 
        this.mclRating, 
        this.movieVsTheaterBias
      )
      Object.assign(_clone, modifiers)
      return _clone
    }
}

export interface WizardConfigurationJSON{
    espaceLacRating: string,
    casinoRating: string,
    paradisoRating: string,
    mclRating: string,
    movieVsTheaterBias: number
}




export class TheaterRating implements Comparable<TheaterRating>{
  constructor(
    public key: string, 
    public rank: number,
    public name: string,
    public description: string){ }

    compare(this: TheaterRating, other: TheaterRating): number {
      return this.rank - other.rank
    }
}

export class TheaterRatings{
  static HIGHEST = new TheaterRating( 
    "HIGHEST", 
    0,
    "Très haute",
    "J'adore cette salle"
  );
  static HIGH = new TheaterRating( 
    "HIGH",
    1,
    "Haute", 
    "C'est une bonne salle"
  );
  static DEFAULT = new TheaterRating( 
    "DEFAULT", 
    2,
    "Moyenne",
    "Pas d'avis"
  );
  static NEVER = new TheaterRating( 
    "NEVER", 
    3,
    "Jamais",
    "Ne jamais rien prévoir ici"
  );

  static enumerate(): readonly TheaterRating[]{
    return [this.HIGHEST, this.HIGH, this.DEFAULT, this.NEVER]
  }

  static fromKey(key: string): TheaterRating{
    const found = TheaterRatings.enumerate().find(r => r.key == key)
    if (! found){
      throw Error(`Programmatic error : unknown movie rating ${key} !`)
    }
    return found;
  }

  static compare(rating1: TheaterRating, rating2: TheaterRating): number{
    return rating1.compare(rating2)
  }
}
