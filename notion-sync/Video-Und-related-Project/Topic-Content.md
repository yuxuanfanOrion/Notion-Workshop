<!-- notion-id: 2bf2a5ae-4040-80bb-8097-e8dbc705a068 -->
<details><summary>

## *Topic1:*
Probing Causal and Temporal Reasoning in Video-LLMs via Programmatic Image Editing

</summary>

  <details><summary>**Background****:** Video Large Language Models (Video-LLMs) have achieved significant progress in global video understanding, such as classification and summarization. However, their capabilities in understanding temporal coherence, fine-grained details, and causal logic within videos remain underexplored. Existing evaluation benchmarks mostly focus on macro-level tasks and lack precise assessment of models' perception and reasoning abilities at the micro-temporal dimension.</summary></details>

  <details><summary>**Methods****:** By performing programmatic and controllable edits on a small number of key image frames in video clips, local temporal inconsistencies are artificially introduced. These edits span multiple dimensions including object attributes, states, and action logic.
(to be added)</summary></details>

  <details><summary>Motivation: </summary>

    <details><summary>Current evaluation benchmarks (e.g., Video-MME, NExT-QA) tend to assess macro-level understanding of entire videos rather than micro-level perception of inter-frame continuity.</summary></details>

    <details><summary>Real-world applications (such as video forgery detection, intelligent surveillance, and AI-assisted editing) require models to possess the ability to identify local and subtle anomalies, yet the reliability of existing models in this regard remains unknown.</summary></details>

  </details>

  <details><summary>Potential editing type:</summary>

    <details><summary>Attribute Manipulation: Color, size, texture</summary></details>

    <details><summary>Object Manipulation: Physical addition, deletion, and modification</summary></details>

    <details><summary>Action / State Maniputlation: Action of human</summary></details>

  </details>

  <details><summary>some examples (red is hallucination)</summary>

    - original video frames

    ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/c7904c8b-9895-4133-a970-225a9d52388e/1f9ec3c7-5296-432b-8d30-b5a91176eaec.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667YSVQCPY%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163402Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJGMEQCIDS5jC93pRSZw%2FOMkke5jaudnXvuYGQlIEEsaVh5hGffAiBTMnUmVx96b3sEqMyPRlMUzyAQ9QKmjcp1FuQpEUhbFSqIBAjM%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMfa%2Bi%2FMBRLmVwNk95KtwDGXleIZEXBjgMylCGzW1PWzhn%2B0kvl7bPKQ%2BcSrB2P9%2BkfMgcj3gioExeWRrzD7U9XGplVsmDivd49qnlrryEaabhMSemQnVjw4yBnzOB4k1b3MOblOOcWYuoB3U9pumKervg0GuS4Z0bUokABf7X%2BaXL3mCrV%2FyOEvwog1VltZx9nUeYftLID5OBQvOUMTLpRETmhqhok%2FVDvlvyfIvhTYd7TL9sq%2FUeHZ6G4M2VmPIaEoxx2i3OhCBm06Nbgi8CtOwHiA9z9QaP4EfKHRg88LIpRGkpJXTpK71gBrN0iBnYMe8IKv%2BruAOjhxiNwc2ySppT3jqbNyFR5YxHGLInChNjLFR5pcawVGJHXSxCVq20hlxS%2FMhUGPeil%2BPFxmmBX%2FY9e6SRnpok9m%2FAdSk4q8%2BYT5E%2Bdv26XMH4wopiUo9b3BR83jiQeUypb%2B9aH5%2BVGEr2oD8PR%2F3HO%2B6LKFpzE6M74zflY7XyCvA4r01Po7DcFXDmGzQFVmIwWpkNgFqMR5o1GcSRQZCNPoDBF0FUpfxnomJF6yoeSq05PDpxyc2z7h6ayap4Xmtj%2FaDSce6jAuR3qSYk5%2F1SZHvhXBb2w0GzLmSdMdPNvTX8QIBWreX3b9S6nFoAMKQCa7ww%2B%2Bj8ywY6pgHnT4921dAiPc5hySDpx1ylO0k7r3Y5sUnSUeoEr6qr86O7dZ6gmg37wLu%2BZLYeK%2BcNT7kEhiOochBPWMraccMdl1xZ%2FBVYrgtUt1%2FqIOt1AbcgqQRwQXiqewzqFqYcJwrbqHZAstdhnPdVWHk6us7bFZOtTl4Jn63GhtUClFyRUnVSL9F1ZiD1Ep9CaRwK1PMSBMbvybjWgRRVRcCJimZTIMiPdusn&X-Amz-Signature=a69b2dc2f9d3d3bfd8c9e8faaad3a2d043f235fff0f683fc8161bcbcef861dca&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

    Q: what's the video about?

    A: This video shows a breakdancing (b-boying) street performance in what appears to be a European city square. A performer wearing red pants and a gray top is executing various breakdancing moves.

    - edited video frames

    ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/f8aabf72-fa56-4b7d-bd6e-7d6cfb939390/ddc66f79-63e3-40f8-9346-f21d7a351c3e.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667YSVQCPY%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163402Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJGMEQCIDS5jC93pRSZw%2FOMkke5jaudnXvuYGQlIEEsaVh5hGffAiBTMnUmVx96b3sEqMyPRlMUzyAQ9QKmjcp1FuQpEUhbFSqIBAjM%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMfa%2Bi%2FMBRLmVwNk95KtwDGXleIZEXBjgMylCGzW1PWzhn%2B0kvl7bPKQ%2BcSrB2P9%2BkfMgcj3gioExeWRrzD7U9XGplVsmDivd49qnlrryEaabhMSemQnVjw4yBnzOB4k1b3MOblOOcWYuoB3U9pumKervg0GuS4Z0bUokABf7X%2BaXL3mCrV%2FyOEvwog1VltZx9nUeYftLID5OBQvOUMTLpRETmhqhok%2FVDvlvyfIvhTYd7TL9sq%2FUeHZ6G4M2VmPIaEoxx2i3OhCBm06Nbgi8CtOwHiA9z9QaP4EfKHRg88LIpRGkpJXTpK71gBrN0iBnYMe8IKv%2BruAOjhxiNwc2ySppT3jqbNyFR5YxHGLInChNjLFR5pcawVGJHXSxCVq20hlxS%2FMhUGPeil%2BPFxmmBX%2FY9e6SRnpok9m%2FAdSk4q8%2BYT5E%2Bdv26XMH4wopiUo9b3BR83jiQeUypb%2B9aH5%2BVGEr2oD8PR%2F3HO%2B6LKFpzE6M74zflY7XyCvA4r01Po7DcFXDmGzQFVmIwWpkNgFqMR5o1GcSRQZCNPoDBF0FUpfxnomJF6yoeSq05PDpxyc2z7h6ayap4Xmtj%2FaDSce6jAuR3qSYk5%2F1SZHvhXBb2w0GzLmSdMdPNvTX8QIBWreX3b9S6nFoAMKQCa7ww%2B%2Bj8ywY6pgHnT4921dAiPc5hySDpx1ylO0k7r3Y5sUnSUeoEr6qr86O7dZ6gmg37wLu%2BZLYeK%2BcNT7kEhiOochBPWMraccMdl1xZ%2FBVYrgtUt1%2FqIOt1AbcgqQRwQXiqewzqFqYcJwrbqHZAstdhnPdVWHk6us7bFZOtTl4Jn63GhtUClFyRUnVSL9F1ZiD1Ep9CaRwK1PMSBMbvybjWgRRVRcCJimZTIMiPdusn&X-Amz-Signature=af4bdd0245d55898ed66bfcef098a218defe00a4fe4dde29c2b1911963812b86&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

    ***Q:***what's the video about?

    ***A: ***The video captures the vibrant street dance culture where performers showcase their skills in public spaces, drawing crowds and creating an energetic community atmosphere. The final frame shows another performer in a red hoodie standing ready, suggesting this is part of a longer performance or battle session. 

    

    ***Q: ***Which frame clearly has a causality error in relation to the frames before and after it?

    ***A: ***In frames 1-7, we see the b-boy in red pants and grey hoodie performing continuous breakdancing moves on the ground. However, in frame 8, suddenly a completely different person appears - someone wearing a red hoodie and jeans, standing upright in the center.

    [The model is able to understand action continuity, but clearly makes errors regarding where (the action occurs)]

  </details>

  

</details>





<details><summary>

## Topic2:
Video Encoder


</summary>

  - Reference literature
    - [https://arxiv.org/abs/2503.13956](https://arxiv.org/abs/2503.13956)

    - [https://arxiv.org/abs/2410.05714](https://arxiv.org/abs/2410.05714)

    - [https://openreview.net/attachment?id=MUjdNcfNPv&name=pdf](https://openreview.net/attachment?id=MUjdNcfNPv&name=pdf) （ICLR’26 Submission）

    - [https://arxiv.org/abs/2501.08282](https://arxiv.org/abs/2501.08282)

</details>

<details><summary>

## *Topic3:*
The Arrow of Time in Language: How Textual Priors Shape Causal Reasoning in Video Foundation Models

</summary>

  <details><summary>**Background**</summary>

    <details><summary>look back to the paper 《Learning to See Before Seeing》[https://arxiv.org/pdf/2509.26625](https://arxiv.org/pdf/2509.26625)</summary>

      <details><summary>Decomposable Visual Priors: The "visual priors" that LLMs learn from pure text are not monolithic, but can be decomposed into perception priors and reasoning priors.</summary></details>

      <details><summary>**Different Origins for priors**</summary></details>

      - Reasoning priors primarily come from reasoning-centric texts (such as code, mathematics, and scientific literature), and this capability is transferable and generalizable across modalities.

      - Perception priors are more diffusely derived from broad and diverse texts (such as web pages and descriptive text), and their effectiveness is more dependent on subsequent visual encoders and multimodal fine-tuning.

    </details>

  </details>

  <details><summary>**Motivation** </summary>

    Current video models are increasingly capable of describing events ("a person slipped"), but are weak at explaining the underlying causes ("because there was a banana peel on the ground"). This capability is key to achieving true "understanding" of the world. We hypothesize that the abundant causal logic embedded in human language (such as scientific explanations, news analyses, and plot progressions in stories) can provide models with a powerful causal prior, enabling them to learn to organize continuous visual signals in videos into meaningful causal chains, rather than merely recognizing isolated events.

  </details>

  <details><summary>thoughts about priors in video llm</summary>

    <details><summary>‘reasoning priors’ in video llm</summary>

      <details><summary>The core of video is time and change, which naturally leads to the need for understanding temporal relationships and causal relationships. Can Video-LLMs learn this ability from pretraining/post-training datasets?s</summary></details>

      <details><summary>for temporal reasoning</summary>

        <details><summary>A vast amount of text, such as novels, screenplays, historical records, news reports, instructional guides (recipes, DIY tutorials), scripts, and film breakdowns, contains rich temporal logic. When learning from these texts, models must understand the sequential order of events, durations, concurrent relationships, and so on.</summary></details>

        <details><summary>Can it be transferred to video? Can the model align abstract temporal concepts from text with visual changes in video? It could more quickly understand that "Character A walks into the room" occurs before "Character B picks up the phone" in a video; or when seeing "a person throwing a banana peel on the sidewalk," the model can, based on its learned world knowledge and causal logic, predict that "someone might slip next.”</summary>

          <details><summary>当一个MLLM被要求理解一段视频时，这种从语言中学到的“时序骨架”可以被直接调用。模型不再需要从零开始学习“先”和“后”的概念，而是将文本中的抽象时序概念与视频中的视觉变化进行**对齐 (Alignment)**。</summary></details>

        </details>

      </details>

    </details>

    <details><summary>‘perception priors’ in video llm</summary>

      <details><summary>description about dynamic scene、action、motion</summary></details>

      

    </details>

  </details>

  <details><summary>experiments</summary>

    <details><summary>Perform continual pretraining on the same model with controlled data proportions to observe performance changes.

</summary></details>

  </details>

</details>
