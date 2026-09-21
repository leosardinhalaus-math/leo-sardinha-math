import * as T from 'three';
export function createWorld(index:number){
 const root=new T.Group();const obstacles:T.Box3[]=[];
 const colors=[0x36d5ee,0xff8861,0x9f7bff,0x4fdda1,0xf4c76c];const accent=colors[index]??colors[0];
 const stone=new T.MeshStandardMaterial({color:[0x23455c,0x67443d,0x363257,0x294d45,0x4f4540][index],roughness:.85});
 const trim=new T.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:.24,metalness:.4,roughness:.4});
 function add(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number,solid=false){const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);if(solid){mesh.updateMatrixWorld();obstacles.push(new T.Box3().setFromObject(mesh));}return mesh;}
 for(const x of [-6,6]){
  add(new T.BoxGeometry(10,1,10),stone,x,-.55,0);
  add(new T.BoxGeometry(10.1,.12,10.1),trim,x,-.08,0);
  add(new T.BoxGeometry(9.8,.12,9.8),stone,x,0,0);
  for(const z of [-4.7,4.7])add(new T.BoxGeometry(10,.45,.22),stone,x,.27,z,true);
 }
 const water=new T.MeshStandardMaterial({color:accent,transparent:true,opacity:.35,metalness:.5,roughness:.2});
 add(new T.BoxGeometry(2,.15,11),water,0,-.35,0);
 for(const z of [-1.65,1.65]){
  add(new T.BoxGeometry(3,.18,1.65),stone,0,0,z);
  for(const side of [-1,1])add(new T.BoxGeometry(3,.35,.12),trim,0,.22,z+side*.8,true);
  for(const x of [-6,6])add(new T.BoxGeometry(9.5,.015,1.2),new T.MeshStandardMaterial({color:0xb5cbca,transparent:true,opacity:.12}),x,.07,z);
 }
 for(const x of [-9.5,9.5])for(const z of [-3.4,3.4]){
  add(new T.CylinderGeometry(.65,.85,1.5,6),stone,x,.8,z,true);
  add(new T.CylinderGeometry(.85,.7,.35,6),trim,x,1.7,z);
  add(new T.OctahedronGeometry(.5),trim,x,2.3,z);
 }
 // Ornamentos fora das rotas: cada ilha conserva sua identidade visual.
 for(let i=0;i<12;i++){
  const x=(i<6?-1:1)*(2+(i%6)*1.35),z=i%2?4:-4;
  if(index===3){add(new T.CylinderGeometry(.1,.16,.7,5),stone,x,.4,z);add(new T.ConeGeometry(.55,1.4,6),trim,x,1.3,z,true);}
  else if(index===1)add(new T.DodecahedronGeometry(.4+(i%3)*.1),stone,x,.45,z,true);
  else if(index===4){const gear=add(new T.TorusGeometry(.36,.13,4,8),trim,x,.65,z,true);gear.rotation.y=Math.PI/2;}
  else add(new T.OctahedronGeometry(.35+(i%3)*.1),trim,x,.65,z,true);
 }
 return {root,obstacles,accent};
}
