import { Box3, Vector3 } from 'three';
// O avanço da lógica (0–100) passa ao eixo X; a antiga faixa Y passa a Z.
export function arenaPosition(progress:number,enemy:boolean,lane:number){return new Vector3((enemy?1:-1)*(9-Math.max(0,Math.min(100,progress))*.18),0,lane);}
// Subpassos evitam atravessar obstáculos em movimentos grandes; deslize por eixo.
export function moveWithCollisions(position:Vector3,target:Vector3,obstacles:Box3[],radius=.28){
 const delta=target.clone().sub(position);const steps=Math.max(1,Math.ceil(delta.length()/.15));delta.divideScalar(steps);
 const half=new Vector3(radius,.85,radius);const bounds=new Box3();
 for(let i=0;i<steps;i++)for(const axis of ['x','z'] as const){const next=position.clone();next[axis]+=delta[axis];bounds.setFromCenterAndSize(next.clone().add(new Vector3(0,.85,0)),half.clone().multiplyScalar(2));if(!obstacles.some(b=>b.intersectsBox(bounds)))position[axis]=next[axis];}
 return position;
}
