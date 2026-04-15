# Venture Spine — Project Lifecycle State Machine Diagram

## State Machine Overview

```
                           ┌─────────────────────────────────────────────────────┐
                           │              PRE-BUILD BAND                         │
                           │                                                     │
     ┌──────────┐    evaluate    ┌──────────┐   shape_complete   ┌──────────┐   │
     │          │──────────────▶│          │──────────────────▶│          │   │
     │  SPARK   │               │ SHAPING  │                   │  SHAPED  │   │
     │          │               │          │◀──────────────────│          │   │
     └────┬─────┘               └────┬─────┘     reshape       └──┬──┬───┘   │
          │                          │                             │  │       │
          │                          │                             │  │       │
          │                          │ abandon_shaping             │  │       │
          │ spark_expired            │                             │  │       │
          │                          ▼                             │  │       │
          │                     ┌─────────┐    shaped_expired      │  │       │
          └────────────────────▶│         │◀──────────────────────┘  │       │
                                │ KILLED  │                          │       │
                                │         │                          │       │
                                └─────────┘                          │       │
                                     ▲                               │       │
                           ┌─────────┼───────────────────────────────┼───────┘
                           │         │                               │
                           │         │           ┌───────────────────┘
                           │         │           │ bet_on
                           │         │           ▼
┌──────────────────────────┼─────────┼───────────────────────────────────────────┐
│                          │         │    ACTIVE BAND                            │
│                          │         │                                           │
│  ┌───────────────┐       │         │    ┌─────────────┐   feature_complete     │
│  │               │       │         │    │             │   or cycle_expired      │
│  │  MAINTENANCE  │◀──────┼─────────┼────│  ACTIVE_DEV │──────────────────┐     │
│  │               │       │         │    │             │                  │     │
│  └──┬──┬──┬──────┘       │         │    └──────┬──────┘                  │     │
│     │  │  │              │         │           │                         │     │
│     │  │  │              │         │           │                         ▼     │
│     │  │  │              │         │           │ pause          ┌──────────┐   │
│     │  │  │   ship_it    │         │           │                │          │   │
│     │  │  │◀─────────────┼─────────┼───────────┼────────────────│STABILIZE │   │
│     │  │  │              │         │           │                │          │   │
│     │  │  │              │         │           │                └──┬──┬────┘   │
│     │  │  │              │         │           │                   │  │        │
│     │  │  │              │         │           │ needs_another     │  │        │
│     │  │  │              │         │           │ _cycle            │  │        │
└─────┼──┼──┼──────────────┼─────────┼───────────┼───────────────────┼──┼────────┘
      │  │  │              │         │           │                   │  │
      │  │  │              │         │           │    ┌──────────────┘  │
      │  │  │              │         │           │    │ pause            │ pause
      │  │  │              │         │           │    │                  │
      │  │  │              │         │           ▼    ▼                  │
      │  │  │              │    ┌────────────────────────┐              │
      │  │  │              │    │       (to shaped)      │              │
      │  │  │              │    │  needs_another_cycle / │◀─────────────┘
      │  │  │              │    │  major_feature_cycle   │
      │  │  │              │    └────────────────────────┘
      │  │  │              │
      │  │  │  begin_      │
      │  │  │  sunset      │
      │  │  ▼              │
      │  │ ┌───────────┐   │
      │  │ │           │   │   sunset_complete
      │  │ │  SUNSET   │───┼──────────────────▶ KILLED
      │  │ │           │   │
      │  │ └───────────┘   │
      │  │                 │
      │  │ major_feature   │
      │  │ _cycle          │
      │  └─────────────────┼──▶ (to shaped)
      │                    │
      │ pause              │
      ▼                    │
┌──────────────────────────┼─────────────────────────────────────────────────────┐
│                          │     INACTIVE BAND                                  │
│                          │                                                    │
│  ┌──────────┐            │           ┌──────────────┐                         │
│  │          │  auto_     │           │              │                         │
│  │  PAUSED  │──hibernate─┼──────────▶│  HIBERNATED  │                         │
│  │          │            │           │              │                         │
│  └──┬──┬────┘            │           └──┬───┬───────┘                         │
│     │  │                 │              │   │                                 │
│     │  │ resume          │              │   │ wake_up                         │
│     │  └─────────────────┼──▶ (shaped)  │   └──────────▶ (shaping)            │
│     │                    │              │                                     │
│     │ kill_from_paused   │              │ kill_from_hibernated                │
│     └────────────────────┼──▶ KILLED    └──────────────▶ KILLED               │
│                          │                                                    │
└──────────────────────────┴────────────────────────────────────────────────────┘
```

## Simplified State Flow

```
SPARK ──▶ SHAPING ──▶ SHAPED ──▶ ACTIVE_DEV ──▶ STABILIZING ──▶ MAINTENANCE
  │          │           │            │               │               │
  │          │           │            │               │               │
  ▼          ▼           ▼            ▼               ▼               ▼
KILLED    KILLED      KILLED       PAUSED          PAUSED          PAUSED
                                     │               │               │
                                     ▼               ▼               ▼
                                  HIBERNATED ──▶ KILLED          SUNSET
                                                                    │
                                                                    ▼
                                                                  KILLED
```

## State Configuration Summary

| State | Band | Max Workers | Budget % | Monitoring | WSJF Weight | Max Time |
|-------|------|:-----------:|:--------:|:----------:|:-----------:|----------|
| **spark** | pre-build | 0 | 0% | none | 0.0x | 3 cycles |
| **shaping** | pre-build | 1 (research) | 2% | weekly | 0.5x | 2 cycles |
| **shaped** | pre-build | 0 | 0% | per betting table | 1.0x | 3 cycles |
| **active_dev** | active | 6 (rec: 3) | 35% | continuous | 1.5x | 1 cycle |
| **stabilizing** | active | 3 (rec: 2) | 20% | daily | 2.0x | 2 weeks |
| **maintenance** | active | 2 (rec: 1) | 10% | daily | 0.8x | unlimited |
| **paused** | inactive | 0 | 0% | weekly | 0.3x | 3 cycles |
| **hibernated** | inactive | 0 | 0% | monthly | 0.0x | unlimited |
| **sunset** | inactive | 2 (rec: 1) | 5% | daily | 1.2x | 1 cycle |
| **killed** | inactive | 0 | 0% | none | 0.0x | terminal |

## Transition Map

### Manual Transitions (Founder Decision Required)

| Transition | From | To | Key Guard |
|-----------|------|-----|-----------|
| evaluate | spark | shaping | founder has capacity |
| shape_complete | shaping | shaped | pitch has all required elements |
| bet_on | shaped | active_dev | <2 active_dev projects, budget available |
| abandon_shaping | shaping | killed | -- |
| feature_complete | active_dev | stabilizing | scope items done or cut |
| ship_it | stabilizing | maintenance | E2E passing, no P0 bugs |
| needs_another_cycle | stabilizing | shaped | rework scope defined |
| major_feature_cycle | maintenance | shaped | new scope requires full cycle |
| maintenance_to_active | maintenance | active_dev | betting table selects it |
| pause | active/stabilizing/maintenance | paused | -- |
| resume | paused | shaped | pitch valid or reshaped |
| resume_to_maintenance | paused | maintenance | was in maintenance before |
| hibernate | paused | hibernated | -- |
| wake_up | hibernated | shaping | -- |
| begin_sunset | maintenance/paused/active_dev | sunset | sunset plan defined |
| sunset_complete | sunset | killed | all users migrated, billing stopped |
| kill_from_paused | paused | killed | no active users/revenue |
| kill_from_hibernated | hibernated | killed | -- |
| emergency_kill | active/stabilizing/maintenance | killed | no active users/revenue |
| reshape | shaped | shaping | pitch flagged as stale |

### Automatic Transitions (Venture Spine Executes)

| Transition | From | To | Trigger |
|-----------|------|-----|---------|
| spark_expired | spark | killed | 3 cycles with no action |
| shaped_expired | shaped | killed | 3 cycles not bet on |
| cycle_expired | active_dev | stabilizing | cycle week 6 reached |
| stabilizing_timeout | stabilizing | maintenance | 2 weeks exceeded |
| auto_hibernate | paused | hibernated | 3 cycles paused |

## Shape Up Cycle Integration

```
Week 0 (Cooldown End)     Week 1        Week 6          Week 7-8
  BETTING TABLE ─────────▶ BUILD ──────▶ SCOPE HAMMER ──▶ COOLDOWN
       │                     │               │               │
       │ Select bets         │ Daily:        │ Force-cut     │ Ship stabilizing
       │ Max 2 full          │  triage.sh    │ active_dev    │ Dependency updates
       │ Max 2 maintenance   │  day themes   │  -> stabilize │ Retrospective
       │ Rest: pause/hold    │  agents run   │               │ Shape next bets
       │                     │               │               │ Refresh all DNAs
       ▼                     ▼               ▼               ▼
  shaped -> active_dev    Execute bets    Cut scope       Prepare next cycle
  shaped -> maintenance   Monitor health  Ship or defer   Run betting table
```

## Kill vs. Pause Decision Tree

```
                    ┌──────────────────────────────┐
                    │  Should I stop this project?  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ Does it have active users     │
                    │ or revenue?                   │
                    └──────┬───────────────┬───────┘
                           │               │
                      YES  │               │  NO
                           ▼               ▼
                    ┌──────────────┐ ┌──────────────┐
                    │ Is revenue   │ │ Do you still │
                    │ covering     │ │ believe in   │
                    │ costs?       │ │ this project?│
                    └──┬───────┬───┘ └──┬───────┬───┘
                       │       │        │       │
                  YES  │  NO   │   YES  │  NO   │
                       ▼       ▼        ▼       ▼
                   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
                   │MAINT │ │SUNSET│ │PAUSE │ │ KILL │
                   │ENANCE│ │      │ │      │ │      │
                   └──────┘ └──────┘ └──────┘ └──────┘
```

## Definitive Kill Signals

These conditions mean KILL, not pause -- regardless of other factors:

1. **Market invalidated** -- the core assumption is disproven
2. **No path to revenue** within 12 months after one build cycle
3. **Founder lost conviction** -- you dread working on it
4. **3 cycles paused** -- 24 weeks of inaction is a terminal signal
5. **Technology obsolete** -- rewrite is cheaper than continuing
6. **Negative unit economics** -- costs exceed all forms of value

## Global Constraints

```
┌─────────────────────────────────────────────────────────┐
│                   PORTFOLIO LIMITS                       │
│                                                         │
│  Max active projects (all active band):     5           │
│  Max active_dev projects (full cycle bets): 2           │
│  Max total workers across ALL projects:     10          │
│  Max founder context switches per day:      2           │
│  Budget circuit breaker:                    150% of     │
│                                             daily cap   │
│                                                         │
│  Budget allocation:                                     │
│    active_dev (x2):    35% each  =  70%                 │
│    maintenance (x2):   10% each  =  20%                 │
│    stabilizing (x1):   20%       =  (overlaps w/ above) │
│    shaping research:    2%                               │
│    meta-operations:     5%                               │
│    reserve:             3%                               │
│                                   ─────                  │
│                                   100%                   │
└─────────────────────────────────────────────────────────┘
```

## Tier Modifiers

Tier is set by the founder and multiplies the state's default budget:

| Tier | Description | Budget Multiplier | Monitoring Uplift |
|------|-------------|:-----------------:|:-----------------:|
| **Tier 1** | Revenue-generating / critical client | 1.5x | Yes (cadence +1 level) |
| **Tier 2** | Strategic investments | 1.0x | No |
| **Tier 3** | Experiments / research / infra | 0.5x | No |

Example: A Tier 1 project in active_dev gets `35% * 1.5 = 52.5%` of budget.
A Tier 3 project in maintenance gets `10% * 0.5 = 5%` of budget.
