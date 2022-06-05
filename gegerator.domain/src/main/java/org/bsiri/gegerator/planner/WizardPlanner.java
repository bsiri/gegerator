package org.bsiri.gegerator.planner;

import java.util.List;

public interface WizardPlanner {
    List<PlannerEvent> findBestRoadmap();
}
