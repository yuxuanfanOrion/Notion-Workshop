<!-- notion-id: 2bf2a5ae-4040-8096-a9bb-f0716c9a9594 -->
<details><summary>

### Todo (before 12.22)

</summary>

  TODO:

</details>

<details><summary>

### Todo (Project 1 - mise-en-scène Bench)

</summary>

  <details><summary>**key questions:**</summary>

    <details><summary>discussed</summary>

      - What’s our unique contribution

      - Do we need to design any unique evaluation metrics?

      - What role does the audio modality play during the inference of Video-LLM?

      - How to sampling frames? Because it is related to the camera shots, the information in each frame is very important, and this situation needs to be taken into account during testing.

      - What insights can we gain, or can we reveal important flaws in the current paradigm of video multimodal large models?

      - The "Subjectivity" Trap: Given that film interpretation is inherently subjective, how do we ensure the objectivity and validity of the Ground Truth?

      - Disentangling Perception vs. Reasoning

      - Is it necessary to add some plain text tests on film theory and single-image tests?
        - for the purpose that we need to perform variable decoupling and attribution analysis

        - eg.
          - Q: What are a **'J-Cut'** and an **'L-Cut'**? What function do they typically serve in a dialogue scene?

          - A: Audio leads video (J-Cut) / Video leads audio (L-Cut); Improves flow; Simulates natural attention shifts.

          <details><summary>**Image Content:** A still from *The Shining* or *The Grand Budapest Hotel*. The scene is perfectly symmetrical, with all lines converging to a single point in the center.</summary>

            ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/3b2b577f-97c4-4a74-aa34-e1e726247602/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4663QZAVWLP%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163356Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJHMEUCIEpwOkTK%2BB28IAZRcQfLZA7nxETu3d2m6CpLiYYFyTxXAiEA9g%2BTauOYfI2%2FZiSo1Zrs2Erv3f0XoXVR4IgvGG2YbX0qiAQIzP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDPEPzj1fpSwZtoI8dSrcAxdQUYkqcZW0pvZ%2FnxOcmSNxLzMyTsbh93jlm3x%2BWhZf3NGS9aOBjS3N2lATehEvhq988vKsJyo8czYH0hHNv2e3A9D7d9TR52oW5vJDDk6WoREwF1VI7BQF1PRxMPMgPYLGMeNruLRYjF7%2B1EhZe4FtlBt5c6LsVCOHZQcvkIMTwe3l5Iupo8JpifnalBvPLHT7hAv%2FcAZLDaPiEOvX4MgNbNUVUw8yL0FCI%2BvlzTh8mwmTMSom9BBu3KPrDeaq4K9logbIA%2Ben6D%2FjgxruJ2IuXuZVEU2vMJtJptEw3vRDaQ4Sb9w2CK80Mx9vF9mRxen6Osn2hMiBspa2VuzV2SB4jS9a4D3OfGuX2DHoUqGqNHIY8EK%2FCqV28dTPdNdTg%2FlpFbfMgXt34hU4J8NMVJnhBvgcD1ovcOlTosiowntZJ4mNZz7n5k1jNpYIUqEGNrxR67jNhb%2BZ7SbijJtFftJsm3aTwtIUOyhs0lwUtdjrncxxiaIK6j42CGmxezYQ0vnzmmfcHRxjn8mEN2NpSq18ReL1tm%2BnrWWh2vMuWLq4apat5uW4VHZW06ocDVMecyxZOldpZIc3lEyu6arr0DPKCmhJNPRKkVqTh7PBctiPtTOiBtNYrEO5%2FaPZMOHo%2FMsGOqUBg7fV9UJ%2FHXeEULHPw%2FoaFbYiLwI5GQbEoJykHVpRGEHmfkvDbTftH66iJCsJuhztG0pl18NuSYbL74MRbyt2SHLWJzi7SOVzs%2FwS6iOC%2B0d4QhMGoFAFiU4aEH6gPUCb9SFrULhEHtZ6CEtKrvIiY1PVF1T5NbmygQgB4bTv%2F79ZZlmYQtQnVimOuLaX8hUoi%2B%2Bpo%2BqRIVimeOMpWZ5X1U9QTtEM&X-Amz-Signature=c8f7f12d7021428bf13e0401e3326955bae2d6e2fcd53b4d5bc4296b0d684545&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

            - Analyze the **composition** of this still frame. What psychological feeling does this specific composition typically evoke in the audience?

            - **Feeling:** Order, Oppression, Surrealism

          </details>

      - **video clip or whole movie**

      - We need sufficient and reasonable experimental design, so we can think about it when conducting data post-processing，we can also refer to this [https://arxiv.org/pdf/2412.10360](https://arxiv.org/pdf/2412.10360)

      <details><summary>**Pre-collected frames**</summary>

        - if the frame sampling for a clip is unreasonable, it may cause the model to see something other than what we want it to see

      </details>

      <details><summary>**QA category （Robustness Testing）& （Consistency Check）**</summary>

        - **Positive Query:** Directly ask for the name of the technique.
          - *Example:* "What camera movement technique is primarily used in this clip?"

          - *Expected Answer:* "Dolly In."

        - **Binary Verification:** Confirming a specific technique (Yes/No).
          - *Example:* "Does this video utilize a 'Dolly Zoom'?"

          - *Expected Answer:* "Yes / No."

        - **Negative / Exclusion:** Asking about a technique that is **NOT** present. This is a powerful tool for detecting **Hallucinations**.
          - *Example:* "Which of the following techniques does **NOT** appear in this video: A. Pan, B. Jump Cut, C. Dutch Angle?"

          - *Logic:* If the model correctly identifies the technique, it must be able to rule out the incorrect distractors.

      </details>

    </details>

    <details><summary>to be discussed</summary></details>

  </details>

  

  - [ ] Investigate the oral and spotlight papers of the NeurIPS D&B Track: medical, environment

  - [ ] Data Collection
    - [x] code v1: basic scraping code for youtube/bilibili videos

    - [x] code v2: google cloud api / filtering, searching pipeline

    - [ ] Data Curation Strategy
      - [x] filtering / transcription

      - [x] collecting examples for the sub-categories

      - [ ] Annotation & QA Design （Ongoing）
        - [x] entry generation

        - [x] filtering

  - [ ] Benchmark Setting
    - [ ] Name

    - [x] Task categories definition (Formalize Taxonomy)
      - [x] version 1/2

      - [x] refinement

  - [ ] Experiments & Evaluation
    - [ ] stress test

    - [ ] sound-specific model test

    - [ ] Fine-grained Analysis

</details>



<details><summary>

## Meeting 1 (2025.12.04):

</summary>

  - Content
    - Discussed potential research topics and identified three main directions related to ***Large Video Language Models (LVLM)***.
      1. (main) Exploring and evaluating some challenges of LVLM in causal reasoning, such as temporal inconsistencies.

      1. Video encoder design

      1. How language priors shape the understanding capability of LVLM

</details>

<details><summary>

## Meeting 2 (2025.12.19):

</summary>

  - Content
    - benchmark setting
      - core question: what’s the novel/big contribution of our benchmark

</details>

<details><summary>

## Meeting 3 (2025.12.23)

</summary>

  - Key questions about the mise-en-scène bench

  - Data collection and filtering pipeline

  - Consider subjectivity of the answer of different 

  - target: NeurIPS D&B track (2026.05)

</details>

## Meeting 4 (2025.12.30)


## Meeting 5 (2026.01.05)

## Meeting 5 (2026.01.12)

## Meeting 6 (2026.01.19)

## Meeting 7 (2026.01.26)