export type StageVictory =
  | { kind: 'replay'; nextProgress: number }
  | { kind: 'advance'; nextProgress: number; nextStage: number }
  | { kind: 'complete'; nextProgress: number };

export function normalizeStageProgress(lengths:number[],saved:unknown,completedWorlds:boolean[]){
 const values=Array.isArray(saved)?saved:[];
 return lengths.map((length,index)=>completedWorlds[index]
  ? length
  : Math.max(0,Math.min(length,Number.isFinite(values[index])?Math.floor(values[index] as number):0)));
}

export function isStageUnlocked(stage:number,progress:number){return stage<=progress;}

export function resolveStageVictory(progress:number,selectedStage:number,totalStages:number,worldCompleted=false):StageVictory{
 const safeProgress=Math.max(0,Math.min(totalStages,progress));
 if(worldCompleted||selectedStage<safeProgress)return {kind:'replay',nextProgress:safeProgress};
 const nextProgress=Math.min(totalStages,safeProgress+1);
 if(nextProgress>=totalStages)return {kind:'complete',nextProgress};
 return {kind:'advance',nextProgress,nextStage:nextProgress};
}
