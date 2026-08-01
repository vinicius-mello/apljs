h ← {
  1=⍵: ,1
  2|⍵:⍵,∇ 1+3×⍵
      ⍵,∇ ⍵÷2
}
⎕←h 9

pow←{             ⍝ power operator: apply ⍹ times
  ⍹=0:⍵           ⍝ ⍹ is 0: finished
  ⍺⍺∇∇(⍹-1)⍺⍺ ⍵   ⍝ otherwise: recurse
}

incr←{1+⍵}        ⍝ define an increment function
⎕←(incr pow 3) 5    ⍝ apply it 3 times to 5

fac←×⌿(1∘+⍳)
⎕←fac 5

qf←{
  a b c←⍵
  (2×a) ÷⍨ (-b) (+,-) √ (b*2) - 4×a×c
}

qf 1 ¯1 ¯1
