// Cloudflare Worker: STUDY LAB PDF question generator
// Cloudflare Dashboard > Workers & Pages > Create Worker > paste this file.
// Add secret: OPENAI_API_KEY. Deploy. Use the resulting workers.dev URL in pdf-maker.html.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function reply(data, status=200){ return new Response(JSON.stringify(data), {status, headers:{...cors,"Content-Type":"application/json; charset=utf-8"}}); }
export default {
 async fetch(request, env) {
  if(request.method==="OPTIONS") return new Response(null,{headers:cors});
  const url=new URL(request.url);
  if(url.pathname!=="/generate" || request.method!=="POST") return reply({error:"Not found"},404);
  if(!env.OPENAI_API_KEY) return reply({error:"WorkerにOPENAI_API_KEYが設定されていません。"},500);
  try {
   const body=await request.json();
   const text=String(body.text||"").slice(0,65000);
   const count=Math.min(100,Math.max(1,Number(body.count)||30));
   const difficulty=["基礎","標準","応用"].includes(body.difficulty)?body.difficulty:"標準";
   if(text.length<200) return reply({error:"PDFから十分なテキストを取得できませんでした。"},400);
   const system=`あなたは医療系大学の学習問題作成者です。必ず与えられた資料本文だけを根拠に、日本語の五択問題を作成してください。資料にない事実を正解根拠にしないでください。標準難易度では、用語の理解・機序・特徴・比較・臨床的な基礎理解を問います。選択肢は5つ、正解は1つだけ。誤答選択肢ももっともらしくするが、資料に照らして明確に誤りとしてください。解説では正解理由と重要な誤答の誤りを簡潔に説明。根拠となるページ番号をsource_pageに整数で指定。ページが特定できない場合はnull。出力はJSONのみ。`;
   const user=`次の条件で問題を${count}問作成してください。難易度：${difficulty}。各問題はquestion, choices（5個の文字列）, answer（0〜4の整数）, explanation, source_page（ページ番号またはnull）を持たせてください。問題の重複を避け、資料全体から偏りなく出題してください。\n\n資料本文：\n${text}`;
   const r=await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",headers:{"Authorization":`Bearer ${env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({model:"gpt-4o-mini",temperature:0.3,response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:user}]})
   });
   const result=await r.json();
   if(!r.ok) return reply({error:result.error?.message||"AI API呼び出しに失敗しました。"},502);
   const content=result.choices?.[0]?.message?.content;
   const parsed=JSON.parse(content||"{}");
   const qs=Array.isArray(parsed.questions)?parsed.questions:[];
   const valid=qs.filter(q=>typeof q.question==="string"&&Array.isArray(q.choices)&&q.choices.length===5&&Number.isInteger(Number(q.answer))&&Number(q.answer)>=0&&Number(q.answer)<=4);
   return reply({questions:valid.slice(0,count)});
  } catch(e){ return reply({error:e.message||"予期しないエラー"},500); }
 }
};