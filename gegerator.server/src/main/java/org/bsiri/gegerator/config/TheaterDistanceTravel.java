package org.bsiri.gegerator.config;


import org.bsiri.gegerator.domain.Theater;

import static java.time.Duration.ofMinutes;
import static org.bsiri.gegerator.domain.Theater.*;
import java.time.Duration;

public class TheaterDistanceTravel {

    private static Duration[][] travel = new Duration[Theater.values().length][Theater.values().length];

    static {
        record(ESPACE_LAC, ESPACE_LAC, 0);
        record(ESPACE_LAC, CASINO, 5);
        record(ESPACE_LAC, PARADISO, 15);
        record(ESPACE_LAC, MCL, 30);

        record(CASINO, CASINO, 0);
        record(CASINO, PARADISO, 15);
        record(CASINO, MCL, 30);

        record(PARADISO, PARADISO, 0);
        record(PARADISO, MCL, 15);

        record(MCL, MCL, 0);
    }

    private static void record(Theater from, Theater to, int minutes){
        travel[from.ordinal()][to.ordinal()] = ofMinutes(minutes);
        travel[to.ordinal()][from.ordinal()] = ofMinutes(minutes);
    }

    public static Duration get(Theater from, Theater to){
        if (from == null || to == null){
            return Duration.ofMinutes(0);
        }
        return travel[from.ordinal()][to.ordinal()];
    }


}
