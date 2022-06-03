package org.bsiri.gegerator.services.aspect;

import lombok.SneakyThrows;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.bsiri.gegerator.services.events.ModelChangeEvent;
import org.reactivestreams.Publisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


// @Order is very important : if that Advice was left with implicit Ordered.LOWEST_PRECEDENCE,
// the Advice parameter binding would not work at all (and crash).
@Order(0)
@Component
@Aspect
public class FireModelChangedAspect {

    private static final String SERVICE_PACKAGE_NAME = "org.bsiri.gegerator.services";

    private ApplicationEventPublisher bus;

    public FireModelChangedAspect(@Autowired ApplicationEventPublisher bus) {
        this.bus = bus;
    }

    @Pointcut("within("+SERVICE_PACKAGE_NAME+"..*)")
    public void isService(){
    }

    @Pointcut("execution(org.reactivestreams.Publisher+ "+SERVICE_PACKAGE_NAME+".*.*(..))")
    public void returnsAPublisher(){
    }

    @Pointcut(value = "@annotation(fireModelChanged)", argNames = "fireModelChanged")
    public void annotatedWith(FireModelChanged fireModelChanged){
    }

    @Around(value = "isService() && returnsAPublisher() && annotatedWith(fireModelChanged)",
            argNames = "fireModelChanged")
    public Object fireEventIfSuccess(ProceedingJoinPoint joinPoint,
                                     FireModelChanged fireModelChanged) throws Throwable {
        // Cast to Publisher guaranteed because typecheck done by the pointcut "returnsAPublisher"
        Publisher<?> pusher = (Publisher<?>) joinPoint.proceed();
        ModelChangeEvent event = createEvent(fireModelChanged.value());

        if (isMono(pusher)){
            return ((Mono)pusher).doOnSuccess((whatever) -> fire(event));
        }
        else if (isFlux(pusher)){
            return ((Flux)pusher).doOnComplete(() -> fire(event));
        }
        else{
            // Not sure what this publisher is so we just fire right away
            fire(event);
            return pusher;
        }
    }

    private final void fire(ModelChangeEvent event){
        // TODO : logging ?
        bus.publishEvent(event);
    }

    // Sneaky throwing event instanciation because come on, empty constructors on empty POJO can't fail
    @SneakyThrows
    private final <E extends ModelChangeEvent> E createEvent(Class<E> eventType){
        return eventType.getDeclaredConstructor().newInstance();
    }


    private final boolean isFlux(Publisher<?> pusher){
        return Flux.class.isAssignableFrom(pusher.getClass());
    }

    private final boolean isMono(Publisher<?> pusher){
        return Mono.class.isAssignableFrom(pusher.getClass());
    }

}
