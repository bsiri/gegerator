package org.bsiri.gegerator.services.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.bsiri.gegerator.services.events.ModelChangeEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.InvocationTargetException;

@Component
@Aspect
@Order(Ordered.HIGHEST_PRECEDENCE)
public class FireModelChangedAspect {

    private ApplicationEventPublisher bus;

    public FireModelChangedAspect(@Autowired ApplicationEventPublisher bus) {
        this.bus = bus;
    }

    @Pointcut("within(org.bsiri.gegerator.services..*)")
    public void isServiceInterface(){
    }

    @Pointcut("@annotation(fireEvent)")
    public void annotatedWithFireEvent(FireModelChanged fireEvent){
    }

    @Before("isServiceInterface() && @annotation(fireEvent)")
    public void fireEvent(FireModelChanged fireEvent) {
        try {
            /*
                FIXME:
                - doesn't work because the AOP proxy is not executing in the
                  same thread than the reactive stream
                - even if it did work, the transaction is probably not yet
                 committed when the method returns
             */
            Class<? extends ModelChangeEvent> eventType = fireEvent.value();
            ModelChangeEvent event = eventType.getDeclaredConstructor().newInstance();
            System.out.println("shooting event of class "+event.getClass().getSimpleName());
            bus.publishEvent(event);
        }
        catch(NoSuchMethodException |
                SecurityException |
                InstantiationException |
                IllegalAccessException |
                InvocationTargetException ex){
            // TODO : better ?
            System.out.println(ex);
        }
    }

    /*
    @Around("@annotation(org.bsiri.gegerator.services.aspect.FireModelChanged)")
    public Object hello(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("hello");
        return joinPoint.proceed();
    }
    */
}
