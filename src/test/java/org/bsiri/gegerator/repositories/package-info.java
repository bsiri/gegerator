/**
 * Notes:
 *
 * Remember : the repositories test classes use @SqlDataset,
 * which works thanks to AspectJ. So this class needs to be
 * woven (compile-time here).
 *
 * The Maven build takes care of that, but for it to work from the IDE
 * launcher you need to configure your JUnit tasks to run
 * 'mvn test-compile' before executing the tests.
 */
package org.bsiri.gegerator.repositories;