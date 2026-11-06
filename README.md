<h1 align="center">Sage-SciPerception</h1>
<p align="center"><strong>Scientific perception for language models · 书生·元征</strong></p>
<p align="center">Connect crystals, spectra, biological sequences, and biosignals to language models through trained projectors.</p>
<p align="center"><strong>Continuously expanding scientific modalities, tasks, and language model support.</strong></p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="https://huggingface.co/internlm/Sage-SciPerception">🤗 Weights</a> ·
  <a href="#examples">Examples</a> ·
  <a href="#results">Results</a> ·
  <a href="https://github.com/InternLM/Sage-SciPerception/issues/new">Feedback</a> ·
  <a href="https://github.com/InternLM/Sage-SciPerception/blob/main/README_zh.md">简体中文</a>
</p>

<p align="center">
  <img src="assets/branding/sage-sciprojector-hero-titled.png" alt="A young scholar explores molecular, genomic, crystal and spectral representations in a scientific garden." width="640">
</p>

Sage Sci Perception maps scientific encoder states, spectral patches, and scientific readouts into a language model's input embeddings, enabling natural-language analysis and structured scientific answers. Explore molecular structure identification, material property prediction, biological sequence analysis, and biosignal classification with task-specific projectors.

**Start with the tools in this repository; get the matching weights and configurations from [Hugging Face](https://huggingface.co/internlm/Sage-SciPerception).** The download tool selects a checkpoint through the repository index and retrieves its configuration and weights from the same revision. You can check projector loading on CPU, then connect prepared scientific features to a language-model service through the [vLLM example](examples/vllm_cif.py). Start with the [CPU quick start](#quick-start) below.

## Examples

Recorded views of scientific inputs, annotations, and task interfaces. Checkpoint evaluations are listed in [Results](#results).

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="assets/spectra-en.gif" alt="Joint spectra, streamed analysis, and a predicted molecule." width="100%"><br>
      <b>Three spectra → molecular structure</b><br>
      <sub>IR, Raman and UV–Vis with streamed analysis and a recorded prediction.</sub>
    </td>
    <td width="50%" align="center">
      <img src="assets/protein-en.gif" alt="Protein sequence positions and reference interface annotations." width="100%"><br>
      <b>Protein interface sites</b><br>
      <sub>Sequence positions and reference residue-level annotations.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="assets/crystal-en.gif" alt="Crystal geometry and its reference formation energy." width="100%"><br>
      <b>Crystal structure and formation energy</b><br>
      <sub>Atomic geometry and a reference material property.</sub>
    </td>
    <td width="50%" align="center">
      <img src="assets/rna-iterations-en.gif" alt="Recorded RNA interface experiments and evaluation feedback." width="100%"><br>
      <b>RNA interface refinement</b><br>
      <sub>Design revisions guided by experimental feedback.</sub>
    </td>
  </tr>
</table>

## Quick start

Download a task-specific projector and verify it on CPU. This first step needs no language-model download or GPU.

```bash
git clone https://github.com/InternLM/Sage-SciPerception.git
cd Sage-SciPerception
python -m pip install -r requirements.txt
python load_projector.py glm-5.3-flash/cif/jarvis --local-dir ./checkpoints
```

The selected checkpoint, task configuration, and repository index are saved under `checkpoints/`. For another task or language-model version, use its ID from the [HF component index](https://huggingface.co/internlm/Sage-SciPerception/blob/main/projectors/glm-5.3-flash/README.md). The [download tool](load_projector.py) also exposes `download_projector(...)` for Python workflows.

Run this from the repository directory to check loading on CPU:

```python
from load_projector import load_projector

projector, config = load_projector(
    "checkpoints/projectors/glm-5.3-flash/cif/jarvis", device="cpu"
)
print(config["task"])
print(sum(p.numel() for p in projector.parameters()))
print(config["output_dim"])
```

Expected output:

```text
cif/jarvis
4314304
4096
```

## Inference with vLLM

The serving path inserts projected scientific vectors into a language model's full templated prompt embeddings and sends them to vLLM through `prompt_embeds` at `/v1/completions`. Scientific features and projection are prepared in the client; the language-model service generates the answer.

### Start the language-model service

Install [vLLM](https://docs.vllm.ai/en/latest/getting_started/installation/) in a compatible inference environment. Use the exact language-model snapshot declared in the selected checkpoint's `config.json`. Run vLLM in an inference environment with suitable GPUs; set tensor parallelism for that model and hardware. This command shows an eight-way deployment example:

```bash
vllm serve /path/to/matching-base-model \
  --served-model-name sage-sciperception \
  --enable-prompt-embeds \
  --tensor-parallel-size 8 \
  --generation-config vllm \
  --max-model-len 8192 \
  --host 127.0.0.1 --port 8000
```

### Generate from prepared crystal features

The [crystal client](examples/vllm_cif.py) renders the checkpoint's native chat template, looks up text embeddings, inserts scientific vectors, and sends the completed prompt embeddings to the server. Prepare `cif_features.pt` as a tensor of shape `[num_atoms, 64]`, containing the real CHGNet 0.3.0 atom states specified in `cif/jarvis/config.json`, in atom order. Once the server is ready, run:

```bash
python -m pip install --upgrade transformers
python examples/vllm_cif.py \
  --component ./checkpoints/projectors/glm-5.3-flash/cif/jarvis \
  --base-model /path/to/matching-base-model \
  --features /path/to/cif_features.pt \
  --api-base http://127.0.0.1:8000/v1 \
  --model sage-sciperception
```

The local language-model directory supplies the tokenizer, configuration, and sharded input embedding table used by the server. The client reads the needed text embedding rows without loading the full language model. For the [vLLM prompt embedding interface](https://docs.vllm.ai/en/latest/features/prompt_embeds/) and release details, see the [HF inference guide](https://huggingface.co/internlm/Sage-SciPerception#inference).

Scientific feature extraction and task-adapted scientific models are separate dependencies; some adapted scientific weights are not yet included in the release. Match each task's `scientific_inputs` before preparing predictions. The crystal example starts from prepared features, while other tasks require their corresponding input preparation and prompt assembly.

## Results

Scores from generated answers using selected task-specific checkpoints. Each checkpoint corresponds to its own task and input representation.

| Benchmark / task | Metric ↑ | Score | Checkpoint |
|---|---|---:|---|
| [JARVIS-DFT](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/cif/jarvis)<br>Formation energy | MAD/MAE | **15.03** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/cif/jarvis) |
| [MPBind](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/protein-seq/mpbind)<br>PPI interface sites | Per-protein F1 (%) | **61.12** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/protein-seq/mpbind) |
| [QM9S](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/spectra/qm9s)<br>Molecular structure identification | Acc@1 (%) | **49.75** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/spectra/qm9s) |
| [SciTS PHU01](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/ecg/phu01)<br>ECG classification | Macro-F1 (%) | **71.53** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/ecg/phu01) |
| [GUE splice](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/dna/splice)<br>Splice-site classification | MCC (%) | **87.87** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/dna/splice) |
| [SciTS NEU06](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/eeg/neu06)<br>Sleep staging | Macro-F1 (%) | **72.01** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/eeg/neu06) |
| [BEACON ncRNA](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/rna/ncrna)<br>RNA family classification | Accuracy (%) | **97.35** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/rna/ncrna) |
| [SimXRD OL](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/xrd/simxrd)<br>Crystal-system classification | Accuracy (%) | **63.60** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/xrd/simxrd) |
| [ATOM3D PSR](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/protein-struct/psr)<br>Protein structure ranking | Spearman (%) | **35.36** | [Files](https://huggingface.co/internlm/Sage-SciPerception/tree/main/projectors/glm-5.3-flash/protein-struct/psr) |

Metrics differ across rows. **MAD/MAE is a ratio where higher is better.** MPBind uses the assembly-1 reconstructed evaluation set and mean per-protein F1; PSR uses mean Spearman. These scores do not describe a jointly trained model. The [HF model card](https://huggingface.co/internlm/Sage-SciPerception#released-projectors) and each checkpoint's configuration identify the released components.

## Framework

<p align="center">
  <img src="assets/framework-en.gif" alt="Scientific inputs pass through scientific representations and trainable projectors into a language model." width="100%">
</p>

A task-specific projector maps scientific representations into the language model's embedding space. During language-mapping training, the scientific models and language model remain frozen while the projector is trained. Some tasks use scientific models adapted beforehand, or combine encoder states with scientific readouts.

## Feedback and contributions

For integration help or a new task request, [open an issue](https://github.com/InternLM/Sage-SciPerception/issues/new) with the task, input format, and the command or step you want to run. For a bug, include the error output and environment details. Please use a small example that can be shared publicly.

If you would like to contribute an encoder, modality, task, or language-model integration, describe the proposed scientific representation and target task in an issue so the checkpoint format and example can be aligned. Star or watch this repository to follow new checkpoints, examples, and integrations; download releases from [Hugging Face](https://huggingface.co/internlm/Sage-SciPerception).

License details have not yet been specified for this release.

## Citation

If you use Sage-SciPerception in your work, please cite:

```bibtex
@misc{sage_sciperception,
  author       = {{InternLM}},
  title        = {{Sage-SciPerception}},
  version      = {0.1.0},
  note         = {GitHub repository},
  year         = {2026},
  url          = {https://github.com/InternLM/Sage-SciPerception}
}
```
