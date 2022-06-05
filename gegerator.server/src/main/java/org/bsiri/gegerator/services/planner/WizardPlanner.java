package org.bsiri.gegerator.services.planner;

import java.util.List;

public interface WizardPlanner {
    List<PlannerEvent> findBestRoadmap();
}
