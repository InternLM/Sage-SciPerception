<p align="center">
  <img src="assets/branding/sage-sciprojector-hero-titled.png" alt="A young scholar explores molecular, genomic, crystal and spectral representations in a scientific garden." width="100%">
</p>

<h1 align="center">Sage-SciPerception</h1>
<p align="center"><strong>Sage Sci Perception · 书生·元征</strong></p>
<p align="center">Scientific perception for language models.</p>

<p align="center"><strong>English</strong> · <a href="README_zh.md">简体中文</a></p>

<p align="center">
  <a href="https://huggingface.co/internlm/Sage-SciPerception">🤗 Models</a> ·
  <a href="https://github.com/InternLM/Sage-SciPerception">GitHub</a> ·
  <a href="#demos">Demos</a> ·
  <a href="#results">Results</a>
</p>

## Introduction

Sage Sci Perception (书生·元征) connects scientific encoders to a language model through trainable projectors. It maps molecular graphs, spectra, crystal structures, protein and nucleic-acid sequences, and scientific signals into the language model's input space, enabling natural-language analysis and structured scientific answers. Projectors are trained for each task.

## Framework

<p align="center">
  <img src="assets/framework.gif" alt="Scientific inputs pass through scientific encoders and trainable projectors into a frozen language model." width="100%">
</p>

## Demos

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="assets/spectra.gif" alt="Joint spectra, streamed analysis, and a predicted molecule." width="100%"><br>
      <b>Three spectra → molecular structure</b><br>
      <sub>IR, Raman and UV–Vis with streamed analysis and a recorded prediction.</sub>
    </td>
    <td width="50%" align="center">
      <img src="assets/protein.gif" alt="Protein sequence positions and reference interface annotations." width="100%"><br>
      <b>Protein interface sites</b><br>
      <sub>Sequence positions and reference residue-level annotations.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="assets/crystal.gif" alt="Crystal geometry and its reference formation energy." width="100%"><br>
      <b>Crystal structure and formation energy</b><br>
      <sub>Atomic geometry and a reference material property.</sub>
    </td>
    <td width="50%" align="center">
      <img src="assets/rna-iterations.gif" alt="Recorded RNA interface experiments and evaluation feedback." width="100%"><br>
      <b>RNA interface refinement</b><br>
      <sub>Design revisions guided by experimental feedback.</sub>
    </td>
  </tr>
</table>

## Results

Selected results from task-specific checkpoints, evaluated on generated answers.

| Benchmark | Task | Metric ↑ | Score |
|---|---|---|---:|
| QM9S | Joint-spectrum structure identification | Acc@1 (%) | **49.75** |
| JARVIS-DFT | Formation-energy prediction | MAD/MAE | **15.03** |
| MPBind, assembly-1 reconstruction | PPI interface sites | Mean per-protein F1 (%) | **61.12** |
| SciTS PHU01 | ECG classification | Macro-F1 (%) | **71.53** |
| SciTS NEU06 | Sleep staging | Macro-F1 (%) | **72.01** |
| BEACON ncRNA | RNA family classification | Accuracy (%) | **97.35** |

## Models

Projector checkpoints will be available on [Hugging Face](https://huggingface.co/internlm/Sage-SciPerception).
