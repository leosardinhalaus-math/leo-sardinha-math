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

export function isStageUnlocked(stage:number,progress:number){
 return Number.isInteger(stage)&&stage>=0&&Number.isFinite(progress)&&progress>=0&&stage<=Math.floor(progress);
}

export function resolveStageVictory(progress:number,selectedStage:number,totalStages:number,worldCompleted=false):StageVictory{
 const safeTotal=Number.isInteger(totalStages)&&totalStages>0?totalStages:0;
 const safeProgress=Number.isFinite(progress)?Math.max(0,Math.min(safeTotal,Math.floor(progress))):0;
 // Only the currently unlocked house may advance progress; replays and invalid selections do not.
 if(worldCompleted||safeTotal===0||safeProgress>=safeTotal||!Number.isInteger(selectedStage)||selectedStage!==safeProgress)return {kind:'replay',nextProgress:safeProgress};
 const nextProgress=Math.min(safeTotal,safeProgress+1);
 if(nextProgress>=safeTotal)return {kind:'complete',nextProgress};
 return {kind:'advance',nextProgress,nextStage:nextProgress};
}

/** Repara índices de ilha corrompidos sem tentar indexar um mundo inexistente. */
export function normalizeWorldIndex(saved: unknown, worldCount: number): number {
 if (!Number.isInteger(worldCount) || worldCount <= 0 || typeof saved !== 'number' || !Number.isFinite(saved)) return 0;
 return Math.min(worldCount - 1, Math.max(0, Math.floor(saved)));
}

/** Apenas booleanos verdadeiros confirmam a conclusão de uma ilha no salvamento local. */
export function normalizeCompletedWorlds(saved: unknown, worldCount: number): boolean[] {
 if (!Number.isInteger(worldCount) || worldCount <= 0) return [];
 const values = Array.isArray(saved) ? saved : [];
 return Array.from({length: worldCount}, (_, index) => values[index] === true);
}
