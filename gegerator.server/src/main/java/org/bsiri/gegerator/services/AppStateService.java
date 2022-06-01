package org.bsiri.gegerator.services;

import org.bsiri.gegerator.config.AppState;
import reactor.core.publisher.Mono;

public interface AppStateService {
    Mono<AppState> dumpAppState();

    Mono<AppState> loadAppState(AppState appState);
}
