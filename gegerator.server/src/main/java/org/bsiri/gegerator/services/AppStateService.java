package org.bsiri.gegerator.services;

import org.bsiri.gegerator.config.AppState;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

public interface AppStateService {
    Mono<AppState> dumpAppState();

    @Transactional
    Mono<AppState> loadAppState(AppState appState);
}
