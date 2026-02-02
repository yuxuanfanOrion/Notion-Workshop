<!-- notion-id: 2c62a5ae-4040-80d2-8482-d5533ee9c1f4 -->
<details><summary>

### Previous Comprehensive Setting

</summary>

  **Temporal Understanding = Σ (N temporal skills × multiple time scales)**

  - MCQ = multi-choice question

  - BCQ = binary choice question

  

  **Big Setting:**

  

  | Task Type | Description / Examples | Remark |
  | --- | --- | --- |
  | Order & Direction &
**Forward / Reverse Classification** | *Let the model select the action  / event sequence
“Is this video played forward or backward?”* | MCQ / BCQ |
  | Causality & Counterfactuals | *Using image editing models to artificially create temporal inconsistency* | MCQ
Using Nano Banana2 pro / Qwen-Image |
  | **Duration & Speed** | *- Which activity lasts longer, A or B?
- Who runs faster?”* | MCQ |
  | **Temporal Relation** | Relation between events:
before/after/during/overlap | BCQ |
  | **Frequency & Periodicity** | - *“How many times does the person raise their hand?“* | Cloze Question |
  | **Identity Tracking & State Change** | color / size / pose / state |  |

  

  Contribution: 

  ### **Tier 1: Low-Level Temporal Perception**

  **Focus:** Physical laws, entropy, absolute time attributes, and continuity.

  | **Sub-Category** | **Example Scenario** | **Example Question / Prompt** |
  | --- | --- | --- |
  | **1. Temporal Reordering**
*(Frame/Clip Ordering)* | The video is split into 3 shuffled clips: **A** (shards of glass on the floor), **B** (a whole cup on the table), **C** (the cup falling through the air). | Please arrange these three clips in the correct chronological order based on physical causality. |
  | **2. Directionality Classification**
*(Forward vs. Reverse)* | The video shows a plume of smoke slowly gathering from the air and compressing back into a chimney. | Is this video playing forward or in reverse? Explain your reasoning based on the physics of entropy. |
  | **3. Temporal Localization**
*(Start/End Timestamping)* | A 2-minute uninterrupted cooking video showing chopping vegetables, frying meat, and plating the dish. | Provide the exact start and end timestamps for the action "putting onions into the pan." |
  | **4. Inconsistency Detection**
*(Anomaly Recognition)* | A single static frame of a person drinking water is artificially inserted into a smooth, continuous sequence of a person running. | Identify the anomalous frame that violates the temporal continuity of the scene and describe the action within it. |
  | **5. Duration & Speed Perception**
*(Pace Estimation)* | The video displays side-by-side clips of a cheetah running and a turtle crawling. | Which animal demonstrates a higher frequency of motion? Approximately how many seconds did the action last in total? |

  ---

</details>



<details><summary>

### mise-en-scène Taxonomy

</summary>

  **Focus on **“cinematic language” Directorial intent, editing logic (Montage), implicit causality, and story structure.

  

  <details><summary>setting v1</summary>

    | **Sub-Category** | **Example Scenario** | **Example Question / Prompt** |
    | --- | --- | --- |
    | **1. Montage Semantics** | **Shot A:** A close-up of a man's face (neutral expression).
**Shot B:** A close-up of delicious food on a table. | Combining the context of Shot A and Shot B, what emotion is the character likely feeling? |
    | **2. Omitted Causality** | **Shot A:** Two people arguing heatedly.
**Transition:** Cut to black.
**Shot B:** One person sitting alone in a bar, drinking heavily. | What is the implied cause of the character's behavior in Shot B? Was this cause explicitly shown on screen or inferred? |
    | **3. Non-linear Narrative** | The video is primarily in vibrant color but suddenly cuts to a grainy, black-and-white sequence showing the character as a child. | Does the black-and-white segment at 00:45 take place in the current narrative timeline or is it a flashback? What visual cues support your answer? |
    | **4. Visual Foreshadowing** | **Opening:** A close-up shot emphasizes a gun hidden in a desk drawer.
**Ending:** A gunshot is heard during a struggle. | The gunshot at the end of the clip can be causally traced back to which object shown in the first 10 seconds? Describe its location. |
    | **5. Spatial & POV Inference** | The camera shakes violently, accompanied by the sound of heavy breathing. No face is visible; the viewer only sees hands pushing a door open. | Is this shot filmed from an objective (third-person) perspective or a subjective (Point-of-View) perspective? Whose eyes are we seeing through? |
    | **6. Semantics of Transitions** | **Shot A:** A small sapling in a field.
**Transition:** Slow Dissolve.
**Shot B:** A giant, fully grown tree in the same spot. | What does the "Dissolve" transition imply here? Has the time jump been seconds, hours, or years? |

  </details>

  <details><summary>setting v2</summary>

    **Four major categories**

    **For each major category, there are some subdivided subcategories.**

    <details><summary>categories</summary>

      <details><summary>Cinematography</summary>

        - **Shot Size:** Long Shot, Full Shot, Medium Shot, Close-up, Extreme Close-up.

        - **Camera Angle:** Eye Level, High Angle, Low Angle, Bird's Eye View (God's Eye), Dutch Angle (Canted Angle).

        - **Camera Movement:** Dolly In/Out, Pan, Tracking/Trucking, Crane/Boom, Zoom, Dolly Zoom (Vertigo Effect).

        - **Lighting & Color:** High Key, Low Key (Chiaroscuro), Color Temperature (Warm/Cool), Color Psychology (e.g., Red for danger or passion).

        - **Composition:** Rule of Thirds, Leading Lines, Frame within a Frame, Symmetrical Composition.

      </details>

      <details><summary>Editing</summary>

        - **Transitions:** Cut, Dissolve, Fade In/Out, Wipe, Match Cut, Smash Cut.

        - **Space-Time Logic:** Montage, Long Take (Oner), Jump Cut, Cross Cutting (Parallel Editing), Flashback/Flashforward.

        - **Theory:** **Kuleshov Effect** (Testing if the model understands how the juxtaposition of two images creates new meaning).

      </details>

      <details><summary>Mise-en-scène</summary>

        - **Set Design & Props:** Environmental storytelling and symbolism.

        - **Blocking:** The positioning and movement of actors (proxemics) to show power dynamics or intimacy.

        - **Costume & Makeup:** Indicators of character progression or traits.

      </details>

      <details><summary>Sound</summary>

        - **Audio-Visual Relationship:** Synchronization vs. Counterpoint (e.g., happy visual with sad music).

        - **Source:** **Diegetic Sound** (originates within the film world) vs. **Non-diegetic Sound** (soundtrack, narration).

        - **Sound Design:** Sound Bridges, Ambient Noise, Use of Silence.

      </details>

    </details>

    <details><summary>Examples</summary>

      <details><summary>Cinematography</summary>

        <details><summary>Short Size:</summary>

          Lawrence of Arabia, 1962

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/c7be9af5-771d-4310-bf59-ba3e7c68348a/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YK2UDBGR%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163406Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJHMEUCIANZHwE8JYI%2BE9RptHFBLiNqi%2FuZd5S0VMIx4AUQUFjbAiEA7PN%2Fui75Z%2BYlg9brG4pvCEupe2PJPPyOvfTYqNg7gfcqiAQIzP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDPvxETxnX5Ve9Aof%2FircA2rEN0O9VgqCdxl7Y21Ly1uelPCfo5WavYCDNXQmC%2FupJHU1OFygU9GqFEshyHI4ZyIwxSGQ7ZI8tfjoUuXSTVpATGDRh73g2BsX3YxWCUl3CXyzxCvSUUCyeK1uehP1D42TyHqvZqOitCABvy8e18NSXPrqpxt1AjdBlDIwsWQQ0SPUtWz24mkABBrayyGmEHqHZwTMJfR%2FItL0T84gEkKKe189VYi3ydikXcXCrCcuPwT89rICe9vQ%2F3NVLEPMkAfViNUJXk2kbXpsvvs9LAr7fcCP4Avo1YrqwW%2FNSWXRgVzz4TMsG1cgo8dIyoxQq%2FGchgRrJsAAWFVLCbT1ssufdgwXccAOECAiFVVklNw0CQitA6iWK36u7M2l%2FqMAQoIQF%2FpUvdedmu2COKoUnIjcs%2F5QA1hiWbu6nFOxri4kAHH2zloomu%2FLku08h4ZYWD4y5PlHI%2B0C0LYIJ7%2Bf0diNIKyqvvLPhPPMhlVeepMPZJHdJIzMLfV8IrLUGYDuOjiQrm1OkpzDDLr%2Bek1OZzI1YGCRuPhVzuE%2FOQ1o71BZdSV%2FKOtfGVfBL3d3lGnLLP5OgjD1LxjepfEbonWruqpPbzdZVx71%2FB%2FAPMYVsJE2w54XM1KxzTihxpeCMNTp%2FMsGOqUBwIAS%2F%2BDWHxQf%2BBHHPnRcDP9y%2F8ue8hvtQltO8EuiTCjpqM1T0t0%2FqGr1ZatEdAjoaAxq1WCeI4ID%2FUtCZDp4r2mwuVVl%2BVCPhYHmgppUouJ7Q6YV9tSHwKmAPLS4IqH1Np5gPjMmIb9GaMYvcqcnqGwjqgkASuAfuRz%2Flw6c8vXvG8lgEabObDHJ7NcOOE0Ct7P2a1cVOycPTy%2FKJzCHjE9ijReL&X-Amz-Signature=1ee61fd6837e9ee050b6d5868947747b42937b250cfd748fb3c0503feab95810&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
"movie": { "title": "Lawrence of Arabia", "year": 1962 },
    "scene": "Camel caravan crossing the desert",
    "question": "In this long shot, the caravan occupies only a small portion of the frame while horizon and sky dominate, and the shot lingers longer than a typical establishing shot. Which interpretation best accounts for BOTH the scale and the duration?",
    "options": {
      "A": "It makes the terrain the primary dramatic agent first, so the characters’ actions read as episodes inside a vast, indifferent world—an epic calibration rather than mere location-setting.",
      "B": "It neutralizes point-of-view by flattening emotional cues, encouraging a documentary-like detachment from character psychology.",
      "C": "It functions mainly as geographic clarification so later cuts preserve orientation; the extended duration is for continuity insurance.",
      "D": "It miniaturizes the caravan to externalize isolation, shifting attention away from narrative stakes toward mood alone."
    },
    "answer": "A"
```

        </details>

        <details><summary>Camera Angle:</summary>

          Citizen Kane, 1941

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/61de4668-21c1-4a56-a245-6a95ecd130c8/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466323SXTNO%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163406Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAcaCXVzLXdlc3QtMiJHMEUCIQDcVzddGJ7WAWbSol4FFab9eO325Z90e2kjp6HXFJUl1wIgR1ZHiRQ%2B4tlg5Uktdk8HbFk7GbEJy6bhK%2FYLwGm5Fi0qiAQI0P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDGzUEqxTHYvZ05heQSrcAw9iCatw4lNOlOyTZMAknxIREtjhZI71RLlcjiP1RJrqw%2BA3BLMqqrckhuyds9yg9NRToicMifUSU6rDFAB6gTf2yoAHrKqOw6fB6V3SUqIK0F1p%2BfcgN4rpklg68mdydE8IC%2Bz6C0OrW2rnLfubPj4ers9YAcqc0O4BPfW6Q2JqODcQeJy6UfR2NzjapnvNxYpDmcdU9xFFSnLjPAVXQwIx23wkz81ybEvM6iUxAJkagiHTLpum4xoX%2FkSmP9CRsHf8ffvFA9Ebbg%2F0z5475%2FM7IEU4E1qc%2BoJnN8YYJoZeN5Ffljekfs4l5oefdk4xuFiQZmVj%2FM5obp87oawmCnYHvQTXGNX1ZZDy9CsbMpsLK9mH9uw2VHXZBVQXwrMSnyDsvRsqasiXqwGCXhrgyE4zsMFyJdt%2FY8tEloUy2WxTujLFhbdjzq0ydWfcKcE72Vs7oZUcAfVD%2Bia5YD61Y%2B6JTutTXgiWEvXXJGPYCJlrY5egWdSVMLuv6P0OxkppLZZQe%2FPfdGI0lzuXLUaFfeces7vdaDb1arhUyUwQoZFgcQ3hL5NcSStMoHwwj95oy7VsmcQcLgUQFNpyCrea7a3trk9eqI%2FeE7Gq1TmM8J1%2F5glfjTramaltt89JMKzX%2FcsGOqUBnJzB03A6k6VEjWDeqZG13mqWMu8UHJ5jzEmDYDIPs5M2t5jZspBtS6PSEp3Q2U2Ntbmc7E7PrhR%2B0%2FkXmEMxjlXj4F89h4%2B1wq8HD2o41UnZ%2FydritG2XYSjkVI%2FTXIF%2B1L0ZZ%2BqjG0%2Bp76mGYdKow3QzS71X36XuPeU7vJ4yrx081Pc%2FC9c92V6djL9unCJz%2F931%2BWmExUMW%2BGEdWLtL9W0QcgI&X-Amz-Signature=53227bc66a4c3903660aa3c5452be50b13a207cdb5a00fd742f752b1f1a196d5&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
"movie": { "title": "Citizen Kane", "year": 1941 },
    "scene": "Kane’s political rally speech",
    "question": "Low angle shots don’t always mean 'power.' In the rally context, with Kane framed as a public figure and the crowd implied below frame, what is the most specific narrative function of the low angle here?",
    "options": {
      "A": "It constructs Kane as a spectacle—authority derived from ritualized public display—so his power feels staged as much as possessed.",
      "B": "It primarily creates fear by placing the viewer in a physically dominated position, turning Kane into a direct threat.",
      "C": "It signals Kane’s subjective self-image, as if we are seeing the version of himself he imagines during the speech.",
      "D": "It emphasizes architectural scale more than character, suggesting institutions overshadow individuals in democratic performance."
    },
    "answer": "A"
```

          


        </details>

      </details>

      <details><summary>Editing</summary>

        <details><summary>Transition</summary>

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/d334f1e7-d20f-423a-8524-925ffbe76a42/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466RF6A5HNR%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163407Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJIMEYCIQD4FhXWDM1GEvA5HyJBYFM0KV8%2FHwPz2Y2Yg6b52nRZNwIhAJwt0jtxEhr4opeEh41WJT1BMEz%2FziRIsao4rE48aqr2KogECMz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgyvhFFVe7pK%2FQo5Lasq3AOmOLIq2JKzfIuGV49d0Xvslk7j85nLeAJ8E%2FHfofji3uJi%2F4VIuu9%2FnMguC7rQyEBdI%2FrBVhJzAqC339FIHwZr5MiiBWu%2BGkcHnDhPPEV%2F1oVAhx2Ip0PMToVeJpZkmteWIASPRzCt4Nrs%2F9ooO5hr6QZNnuvZVIvzvzGedk9aXp32BKSXNb0fxFe7jDq8lRUZrsqhRd5m9eD7tJ2i7it9dBU7eZMlTMBcDc%2FWDngF6fCskg%2FR08nIJQlV1nhVeF3jwaE2m%2F%2FtOPjbWrCjTkd39AwXmYGZGoSHTJCsWvtlmkomw%2F9kiUwhcRuHIZ8JtTst3tlfsseGHJFR5qhkxK0XaqE0HDQ6iBYU6O39KVuLq7kU02uTTuwJ4b4wx5KCGxksqS9il0Q%2FULLHl%2BXBbjTNqe4%2FI7f6SYeUD7ZQi6O5Hym%2FuxM59NsFcoRaEQTtfahALv08rkOnDgktExeNJ5gowDcYKroiRbqr0kWZHmntRlM%2FCCwiXwjVg3CycfFYRTmZTI5wEN8XoNDNGeOYPqZkf0rQUk18SJ%2Bgm5rByLSz5ED350MQAnDMZrM7jyv9Aq%2Bj2IIcvU7ydjJ0t89BiuGGz0RTlMwK4IKEwjywqlDuDEwWM9WArMuiTjwY9TCH6fzLBjqkAXtPeiSUdhMMvP%2FquzTVB%2FRVCykMzW5fQkcevWvFLJptFpMFxQmwWfa0LNhLQHSOQbZCdnk%2Fqexun%2FrIN3HD5n2%2B1N1YkW%2FZ9YrfftolPKd6V8G4BOqqt6XlkcryW4%2Fzr1ukad%2BeGGVzQbObWl1AEjRSrZtqitwEE0qSwIIQcVfI%2FdMoU9fHt0f4o8NiLKq0bbfPr2awUaQaKzj4F9plC24VhPYQ&X-Amz-Signature=b3f58c8434ce822332cd113f5ab488ed2a36d458781ffc7ff1e8c65c8658194d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
 "movie": { "title": "2001: A Space Odyssey", "year": 1968 },
    "scene": "Spacecraft interior corridors and aligned framing",
    "question": "Perfect symmetry repeats in the spacecraft interiors. Beyond 'order,' what is the most precise effect of such symmetry on how the viewer experiences humans inside that space?",
    "options": {
      "A": "It makes people read as components inside a system—centered but not privileged—so the frame suggests procedural control rather than personal agency.",
      "B": "It increases comfort by offering balanced composition, making the environment feel safe and familiar.",
      "C": "It primarily showcases production design detail, inviting admiration of the set as spectacle.",
      "D": "It accelerates narrative pacing because symmetric frames are faster for viewers to parse."
    },
    "answer": "A"
```

        </details>

        <details><summary>Montage</summary>

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/baeb48bb-8bfb-448c-90f0-59db07b2db8d/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4663ZVLDLDM%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163406Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJHMEUCIAmwSvKUeCI55TUoTeqZ2N%2B8W7phbY9JfYBibzzGgGh8AiEAjHgWLbqnJJEbdVOzh3lvx9wXMF251GtXlh3LbsZpSrsqiAQIzP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDETqrpQMIMHkRFebkyrcA9ST6JgtKpuPBdlCG1sy%2Bw5x%2Fyd7lulsmgr4nEYittsxA%2F3P8yD6KZqcgtDuvFKxb5sMj2c7YEESO4%2FoutD8myLWamEjAOXJYb72omJ3SXIaesgelWmmVW4OjRdDhsHpq%2BhdVv0FBZX0ZJzRWR%2Bkj6VtgsqJsOuxLIO9c4CrpIOdLYy9qgM8VscDGufOuxwkc9EMjL1ip7sehLyk4aCKMGNM0xetfwy3kTAIZnnhJKgqEqsJu1oPPU7Tj8q7FL2dXMq5iZ9F2ikTvhkwlKJ3ddqjuLhH3njKYi5GreCSMnWt0HgzDCQLuejZV40m5VOSPLY05i6jaKdFb5qxHk6NdSCaWzDqfXpzyS7Yr3Lwjk6MweMZ9Mjm%2FjHtlo7JpVpzjVO6oIsueWlWWLH9L20BXXKwUd3j4wPQFggAnh2U6ltpWxGQPxndT9qa4QMQEBWqxYnXlaDSnuoUvM7g5ourqhh6z9JFTOhFL5bcUlXrkkBKoSof5Cp5VXn0OoGff04Vrkyv8%2BbRYeeWYs13ISNbe%2FpOhfQ4EkiELS7eNTJJSCxO1a%2Fopmm%2BtPsqPa3s910ONjrJSfs9qos%2BAdxeidcpN5XE1lGjgbikDe%2Bo7sQpw4tB%2B8kk42dHURIoBAFyMPHo%2FMsGOqUB2DiJmsG%2Fap3F1TdWx9qxKjW9%2BpbgdTC7rug84mzXEWQaPZI%2BGi6x9eEZ%2Fz3WdbMVH2JAy9yRwQqmGle7cobZwjoccjR171PC7msPWuwNDdVYXqQ%2BdZJoF6Rggbh56N3oiSi8a3DLshInZYsnJljakfNPkY4l0ryIbJLzOJSbwvabblc3IhMg5cE4oGsKeUkyixmD42p4bV4QzERetdXX%2FzxjPXyc&X-Amz-Signature=42047530b34fd10bc2157ff15d32361c4b08a5fb6545e85208e536f2f40c36a7&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
"movie": { "title": "Rocky", "year": 1976 },
    "scene": "Training montage sequence",
    "question": "The training montage compresses weeks into minutes using repeated actions, music-driven rhythm, and escalating benchmarks. What is the most accurate function of this compression beyond saving time?",
    "options": {
      "A": "It turns progress into pattern recognition—effort becomes a visual grammar—so transformation feels earned through repetition rather than narrated through exposition.",
      "B": "It hides gaps in narrative logic by skipping scenes that would otherwise require additional characters and locations.",
      "C": "It heightens realism by approximating how athletes actually experience training: as a blur of similar days.",
      "D": "It shifts emphasis from character to environment, using location changes to broaden the film’s social scope."
    },
    "answer": "A"
```

        </details>

      </details>

      <details><summary>Mise-en-scène</summary>

        <details><summary>Set Design & Props</summary>

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/6308640b-b05e-4262-8a8f-e4563810689b/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666RZAVHYB%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163407Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJGMEQCH0ztnwbiFrospjXWQmfsMwCTxpMWjVOU6svMVJ40VKwCIQCszpehU4IBt4ceff6Y03xTyUl6IiOhMv8wMO74hD0MpyqIBAjM%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMVGG7L6vj5N%2Fh8E%2FUKtwDIro8JP%2BfCZfnKREbUuJ465fgD1aatlOGIl4UWRcon5I6AxsPIT%2Fq%2F2uswyE0tcvXvOD6Jbj2WZ4qwDObkVBHRVtriUlZoHwL9hhfyblA2puion5LTaNsdHNIKXNxwo20e%2FlTN1GUTYjmxnVtLxHrg4JE7JwxGBlU2DB8Sb5Hy5K3FUroOC4h1I9FwpgV1Fu7KgMPOSclh1rPyDzpbALZZccYekDHuLKOJWUm8PGhrI%2FDfQxCYF4mDzkWpcDdrsJ5fjQrHx2w7sEieK2%2FN74Cd4l5U62leX%2FVLE9aEhaSI6PxOpcgbcN1cyD9ncbkZKU51VZV%2Fy08vDIH%2FC5ZCf00IAA5kuH3MAZhHWTD0FftgQMobU3G9o8wxO0rmQskzLuIQvuh%2FAg%2B4rUzK1ANBltuLeojVq4pu0NKOJAN%2FyRuZWSFu0ReiLZtpjDlrpShBRCVIMLBW1T%2FfFwZjyvjqAyQkzt1y91KM5p3xX6Ml51IYqxy3iBja4XcJBYtESb3tkrEsLkwKr9qRgEC25FSs2CTAbQfM9bWGuGDWiT2%2Fa%2FFYZQoilnCR5S9ojMq8jWGgOQBje3hjmdjAkI7%2Br3ocfdUYFFCA3x4roBKs3UWRKwviV4oIFslz%2BRyEKoOqRcwtuj8ywY6pgFofrm72Cp6McGWK4wnY5OQNbv7bpVjBqaeOxhto44hyS7W47FgxK%2FvZlpzbRcZKmbE1LHZqHtVsKrLoBM51eCwfoLGXpxsylaH2LvZ4gOEtrMIOkkPZgl57I1VnO%2FjB2B8gjPrw54%2BEAs3f%2FIOE4yWcwpH6nFy%2B6ns7Rt3xA1WuGaYGz5uAdxj1XdSP4YgmoXo%2FuxgZVt4%2FHrIsqyXwWP1b9x3DWBF&X-Amz-Signature=24749364aaf4000a58a476d097cc3f51d14b074064266bc4a6abb7e684ad9967&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
"movie": { "title": "The Grand Budapest Hotel", "year": 2014 },
    "scene": "Hotel interiors: pastel palette, symmetry, ornate décor",
    "question": "The hotel’s stylized palette and meticulous symmetry persist even when the story darkens. What is the most precise narrative role of this design strategy?",
    "options": {
      "A": "It frames the past as a curated artifact—beauty as preservation—so the coming brutality reads as intrusion into a constructed memory-world.",
      "B": "It makes the setting more realistic by matching period-accurate architecture and color references, grounding the plot historically.",
      "C": "It primarily functions as character exposition, revealing the concierge’s personality through the environment he controls.",
      "D": "It reduces emotional intensity by aestheticizing everything, keeping the audience from taking the political stakes seriously."
    },
    "answer": "A"
```

        </details>

        <details><summary>Blocking</summary>

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/2093fa16-81ea-462f-8e57-680f23dfce97/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KJQJ63T%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163407Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJGMEQCIBfX3za0p0BtCaolwVB1Edsq5YuzDH7ygT5n9zjrAcA9AiA9qJLLAaJ5F4qzYRAXN9dQm6R%2Fr7Dicd9hXdVLdo3C%2BSqIBAjM%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMfpBuJx5lawpeX9L9KtwD8LGlbIdin6rLATzVM4KbcrjwNU6UsQFrtdMg1mb1iQ2RdKtFnwWby3gydZF1j4fzDPW8xjWyfRSSLm09xZtxfJNomrQTrWdUzH42F9MySLIbB1Wg%2BiYfEQiQmQBZpkQZk8IIqSmu92NoJwcK2KficiyTTrFU9wkx760m%2FJqMLNcgVNdFvacMn%2BViA52%2B22223eL%2BNjRqioxAKhQP%2FMJ7%2FmmBJqDkqzgFyagMaTpDhA4uyzQojFnSeiagKCo0LicO9aQOGtnRrVlDDGg9fb7CV2SeFKIRoCbeF90X36EYYsIQHQmqkcm2ElLVaNGOgIDnJhr4aIJissrp0NWknEonKWJWLwtlF%2FnPNIpGTWKwUAw7r4OEIvOG2b%2BgyHVIugAfDNq10IJHDpwhQ4uDjzTgCD%2Fqn97KhtJ2WqfSRRM495Yw%2BfYhU%2BKtkc5Jy9PoyeW2%2FeChGvuBy0kGtSeBx1byZdv9VKtl4XtT4MKwmT8n3HAD6LuIiFRUDk1NAXYcojcyIM9W%2FPbR42K0U7IaWWw25wryIk%2FvO0%2BHNeVXc5c%2B5EQoNb2cEaBvERvW%2Fwl51mNbiLFnbP7qhaXhoNDVRFgbcVbspI41wcxW7tcjo0q4IqhNGgITl14NQ2LY60ow%2Fej8ywY6pgHuEqBYF9BtZd9t4BVbD2iaWO%2B2QfDwxGIVBeY0iZ9dH8Vy%2FgCMamYeddSpAQVBIfQoLv29BQ9Ld4ljlijn5giu4fQrKcPgyw6NoEqlYZaho8YK4jIXK4A3QRT2UOQW%2Btpw58gDn2%2FWL3DetAOFz%2B%2BrJcyWo0Q9IYaRhhU4d3rqfLCWHEyfLRV8en9L6aX%2FvZOibUExXxrkp%2By4uCpqJZqqPuj8pu97&X-Amz-Signature=1e2c33990b90dfd23433991c30fbe7cdf330216ef64eeb4ad12aff4c8e4e1752&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
    "movie": { "title": "The Social Network", "year": 2010 },
    "scene": "Boardroom / negotiation confrontation with asymmetrical seating",
    "question": "What is the most accurate account of how this blocking works rhetorically?",
    "options": {
      "A": "It turns the room into a diagram of coalition versus singularity—power appears as coordinated alignment against an individual node, not simply numerical majority.",
      "B": "It grants Mark dominance because he occupies more negative space, visually enlarging his authority.",
      "C": "It primarily reflects realistic meeting etiquette, prioritizing authenticity over symbolism.",
      "D": "It improves sound capture by grouping speakers, incidentally producing perceived power contrast."
    },
    "answer": "A"
```

        </details>

      </details>

      <details><summary>Sound</summary>

        <details><summary>Audio-Visual Relationship</summary>

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/58db9c50-265b-4083-b5a8-168082382d17/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666EGQJJRP%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163409Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJHMEUCIQDdRv47WmESctLWF8glfO645nnnXeAaRxCX70PA7uLFtQIgc1azvqJToyupo6wmceneu2vXp0z%2FJMXWtpBdYZh%2FiBwqiAQIzP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDCLeMxYz2wN5EiTxlyrcA5T4GoaQmnUrdoGjj9wr54ZbT04Vg7mIpdTibIgkzD4pZp%2Bqa1cKE2eT0BON%2BEb0LIN1mK32AxhWtb0AH9%2FZ%2FtumQF5NTuXOwMsinxkLVGOB19461fJIyEutVZe8SKkhh6yHRcW3ZJ8pmlDaKcs5%2BBxrSpoo8MRN0FY%2FTRNYG9BGIvGouMBvuPKF1HJs6yzTZuSo%2FdMshTaGIYMIv1bLpLNht2KxeBotYTdWCMDJK5%2BW7YJxPxNax4yDZkxVAB7r5RM5M5XcQqL8VlGrfR4Dxy9gWjSdjYq8r0yg%2FmZ5OC2oUsWLvqAd9828gisb5zPy6ZNIWxhw8leV6EGt5RtALIWboWPx0qzmnCIkxoqdl1TE0uiLF6pij%2FRKVUYfJ95nrRXfYmtbrOTXlDiKvuysh1CfiAViG9%2Fg7oXY%2B62OXUBXSpHglXOMMkXaJEelIAVA18EoZmzaHFykRlu48sV%2BMrqgab%2BI8DECiZXJs3qkM%2BxM0aIkOjIQb0r5Xyo5316n%2B%2F%2BfxeD06zc5LtkXPaD68gGkW9voFMlu4T8b56Dt29nQQ8AV8jOTFhSchu94uZJ9pvkmB0XW5ib%2BYmiK0KwhQ993FShqYIVvC%2BA%2Bpo0T2vKvLISr6kmb%2FevK6291MP3o%2FMsGOqUBdXUpDllGj4I7JtQqurBUTCzLqNn%2FXpB8QTbYMZ0aYcIiyRKdIyFY9TPE5yUzaTzsbijv4rYWAsLxf%2B8cyLCPInPaMvGCl8xvRIN8O9aD2u2qf74ca2Za7TL7zQ5g1NWLvjVlk29oDjW%2Bt1TcIW6NqXSYqb4fUQ54fYva45RVHzdl7zgkumM9%2FsBqy5sdi45McqOWAgvl0V6bYyNMsCvM2Mw5kCOL&X-Amz-Signature=6df704aa7082e2d8bba83e60e2a4506e5a360a3657afac986eb78ff558e59d14&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
    "movie": { "title": "A Clockwork Orange", "year": 1971 },
    "scene": "Cheerful song over violent action",
    "question": "A cheerful tune plays over violence. What is the most precise account of what the counterpoint does to the viewer’s moral position (beyond 'contrast')?",
    "options": {
      "A": "It reframes violence as performance rather than catharsis, making the viewer aware of their own spectatorship and discomfort rather than simply fearing the act.",
      "B": "It reduces the brutality by providing emotional relief, making the scene easier to tolerate.",
      "C": "It increases realism because people sometimes sing while acting, so the scene feels less staged.",
      "D": "It turns the scene into comedy, instructing the viewer to interpret the violence as harmless parody."
    },
    "answer": "A"
```

        </details>

        <details><summary>Synchronization</summary>

          ![image](https://prod-files-secure.s3.us-west-2.amazonaws.com/95d3e319-29bf-4e6e-9d9c-a97e1ca057a8/fe2c926a-1195-447c-9e91-aec9c5eb9dd5/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4665NVWXWKJ%2F20260201%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260201T163408Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAMaCXVzLXdlc3QtMiJGMEQCIFlCVg7wJU4x27V%2BTF%2B5LWul%2B1xN1Yk7XUaTtKuI9JI%2FAiBwZp7yYnLm69ssqbEpR9eNG%2BRd%2Fi1XvWYj%2BlD2hOEgfyqIBAjM%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMv92t9U4nrYP76qHnKtwDYArqaE494tStfJduK645XO6m6we9X0FZMQjkWYC5G0p6NiR9HHUxIT1s0%2By6dlYJD0I4jBkNfi2Il2DIKsPEURDQFGa%2BBBasO6GRInb%2BRAbY2IJ0gVUFd8sntixGJ6r4lM7lWPjU%2FNWtiEcnsJI9ifjcltnF99AGomwJEgJaKDt%2BKOfE4q2%2Bz35SuMTU4BEw0noKr3D6mwzZ4lIisMMJeF4HCT4VmS4b8%2FZxEKWnVPKrPvUsOw2n3Vexf%2Fax3HGMocklFOgiwhvGkqKnaTpxMLD%2BVgzU3m4jFJJSGjlo9HUroCg0uNmosbNcxkZIeWUXE1eU1J1X1mHIghgX4z9vgjFJfmzFcJKAm27YfyWXsBCbq4Hz8tSZfnIDlzC7DGvS5kRGrAU93xvDsFN5%2BKMpoNAqYVuJnu1ARsr8zbWubXYsqCXYU1s0FlE1w95%2BAdgCdvkV6aime1%2BDcZuqjaZLjRM8n9y4E5xJ248msniOLKA7yHgo9k7D5Y3BEQpOEWnM3kx8HWbWyMas6Ic%2FmX67cgyBPDbaktZCtffz4Hp3GmM5K8mOzJis7DngpG27sGaT5l%2FObqkfc%2FH%2Bns%2FUleXWNbIyKwYcX43NxM%2BrUVLmf7mWnN9LI2KtjgoxsREwwuj8ywY6pgFV%2FCrKRMnurqC3h2tA8OrlG1ahzQj65tgp5NvRQIibzzcGMHtjiBkrLpW4XBxdLaFw%2FiZ7GSEjCUr%2FJmS0fRJvjKbDHUBW5PUhHxukEX0N8ap41s%2FtfcN8mdubBd%2B%2BrSOrtj%2FAPQcwkq3AthR721Kk%2FuMcD1UU35cAQlUCDt11QTNHlUXJWwGVTWYKtiFUgsKvhy3HkYTjS%2BAQ79njs8y%2FPcI4TeiX&X-Amz-Signature=11af23f1d0ffab2dc837dc65a252874a0eb1577ac94b6690bc7f83eb82bb0319&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

```markdown
"movie": { "title": "Dunkirk", "year": 2017 },
    "scene": "Airplane dive with engine sound locked to musical rhythm",
    "question": "Engine sound and score rhythm align so tightly that mechanical noise functions like percussion. What is the strongest psychological consequence of this design choice?",
    "options": {
      "A": "It collapses diegetic noise and musical pulse into a single tempo, making threat feel bodily and automatic—tension is experienced as rhythm, not just narrative risk.",
      "B": "It increases realism by accurately reproducing how engines sound at different RPM during dives.",
      "C": "It clarifies spatial orientation by letting the audience infer altitude and speed from audio cues alone.",
      "D": "It reduces complexity in mixing by keeping sounds in the same beat grid, preventing auditory clutter."
    },
    "answer": "A"
```

        </details>

      </details>

    </details>

  </details>

  <details><summary>refer paper / book</summary>

    - [book] Film Art: An Introduction. David Bordwell & Kristin Thompson

    - [book] The Five C's of Cinematography. Joseph V. Mascelli

    - Taxonomy of Directing Semantics for Film Shot Classification
[https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=4914819&casa_token=Rg0-9FSb048AAAAA:D966NUVW8jZrvLyxH0yonYlgrjoM_wWy0G97kvLoWbfrgHQIDTvnLaog_pjh79bCc9uJyokbKre-&tag=1](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=4914819&casa_token=Rg0-9FSb048AAAAA:D966NUVW8jZrvLyxH0yonYlgrjoM_wWy0G97kvLoWbfrgHQIDTvnLaog_pjh79bCc9uJyokbKre-&tag=1)

    - Stable Cinemetrics : Structured Taxonomy and Evaluation for Professional Video Generation (NeurIPS’25, D&B) 
[https://arxiv.org/pdf/2509.26555](https://arxiv.org/pdf/2509.26555)

  </details>

</details>
