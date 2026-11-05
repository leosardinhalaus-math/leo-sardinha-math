import {PDFDocument,PDFDict,PDFName,PDFArray} from 'pdf-lib';
// Parse untrusted PDFs in a separate, time- and heap-limited process.
try{
 const parts=[];let size=0;
 for await(const part of process.stdin){size+=part.length;if(size>5*1024*1024)throw Error();parts.push(part);}
 const bytes=Buffer.concat(parts);
 if(!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw Error();
 const pdf=await PDFDocument.load(bytes,{updateMetadata:false,ignoreEncryption:false});
 if(pdf.getPageCount()<1||pdf.getPageCount()>200)throw Error();
 const forbidden=new Set(['JS','JavaScript','OpenAction','AA','Launch','EmbeddedFiles','EmbeddedFile','EF','AF','XFA','AcroForm','RichMedia','ByteRange']);
 const visited=new WeakSet();
 function inspect(object){
  if(!object||typeof object!=='object'||visited.has(object))return;visited.add(object);
  if(object instanceof PDFArray){for(const item of object.asArray())inspect(item);return;}
  const dict=object instanceof PDFDict?object:object?.dict;
  if(!dict)return;
  if(dict.keys().some(key=>forbidden.has(key.decodeText())))throw Error();
  const action=dict.get(PDFName.of('S'));
  if(action instanceof PDFName&&['JavaScript','Launch','SubmitForm','ImportData','GoToR','GoToE','URI'].includes(action.decodeText()))throw Error();
  for(const value of dict.values())inspect(value);
 }
 for(const[,object]of pdf.context.enumerateIndirectObjects())inspect(object);
 const info=pdf.context.trailerInfo.Info;if(info)pdf.context.delete(info);
 pdf.context.trailerInfo.Info=undefined;
 pdf.catalog.delete(PDFName.of('Metadata'));
 for(const[ref,object]of pdf.context.enumerateIndirectObjects()){
  const dict=object instanceof PDFDict?object:object?.dict;
  if(dict?.get(PDFName.of('Type'))===PDFName.of('Metadata'))pdf.context.delete(ref);
  else if(dict?.has(PDFName.of('Metadata')))dict.delete(PDFName.of('Metadata'));
 }
 // Rebuild from pages so unreachable objects from the original Info dictionary
 // and previous PDF revisions are not carried into the delivered document.
 const prepared=await PDFDocument.create({updateMetadata:false});
 for(const page of await prepared.copyPages(pdf,pdf.getPageIndices()))prepared.addPage(page);
 const output=await prepared.save({useObjectStreams:false,addDefaultPage:false});
 if(output.length>5*1024*1024)throw Error();
 process.stdout.write(output);
}catch{process.exitCode=2;}
