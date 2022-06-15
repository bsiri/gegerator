package org.bsiri.gegerator;

import java.util.BitSet;

public class Scratchpath {

    public static void main(String[] args){

        BitSet bs = new BitSet();
        bs.set(1);
        bs.set(3);

        System.out.println(bs.nextSetBit(0));
        System.out.println(bs.nextSetBit(1));
        System.out.println(bs.nextSetBit(2));
        System.out.println(bs.nextSetBit(3));
        System.out.println(bs.nextSetBit(4));


    }
}
