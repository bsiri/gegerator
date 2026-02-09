package org.bsiri.gegerator.planner.copilot;

import java.util.List;

import org.bsiri.gegerator.planner.PlannerEvent;
import org.bsiri.gegerator.planner.WizardPlanner;

/**
 * Implementation of WizardPlanner by Copilot
 * 
 */
public class CopilotPlanner implements WizardPlanner{

    final private List<PlannerEvent> events;

    public CopilotPlanner(List<PlannerEvent> events){
        this.events = events;
    }

    @Override
    public List<PlannerEvent> findBestRoadmap() {
        // TODO Auto-generated method stub
        return List.of();
    }
    

}
