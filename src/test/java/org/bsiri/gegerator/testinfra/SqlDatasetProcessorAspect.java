package org.bsiri.gegerator.testinfra;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;

import java.lang.reflect.Method;

/*
 * Handles the annotation SqlDataset.
 *
 * Weaved by AspectJ, but injected by Spring (see
 * PersistenceTestConfig).
 *
 */
@Aspect
public class SqlDatasetProcessorAspect {

    private DatasetLoader dsLoader;


    public SqlDatasetProcessorAspect(){

    }

    public void setDsLoader(DatasetLoader dsLoader) {
        this.dsLoader = dsLoader;
    }

    @Around("@annotation(org.bsiri.gegerator.testinfra.SqlDataset)")
    public Object injectDataset(ProceedingJoinPoint jointPoint) throws Throwable{
        MethodSignature signature = (MethodSignature) jointPoint.getSignature();
        Method method = signature.getMethod();
        SqlDataset annotation = method.getAnnotation(SqlDataset.class);
        String datasetPath = annotation.value();
        dsLoader.load(datasetPath);

        return jointPoint.proceed();
    }

}