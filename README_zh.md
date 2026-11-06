<p align="center">
  <img src="assets/branding/sage-sciprojector-hero-zh.png" alt="书生在科学花园中探索分子、核酸、晶格与谱图表征。" width="100%">
</p>

<h1 align="center">书生·元征</h1>
<p align="center"><strong>Sage Sci Perception</strong></p>
<p align="center">让大模型感知科学数据。</p>

<p align="center"><a href="README.md">English</a> · <strong>简体中文</strong></p>

<p align="center">
  <a href="https://huggingface.co/internlm/Sage-SciPerception">🤗 模型</a> ·
  <a href="https://github.com/InternLM/Sage-SciPerception">GitHub</a> ·
  <a href="#演示">演示</a> ·
  <a href="#评测结果">评测结果</a>
</p>

## 简介

书生·元征（Sage Sci Perception）通过可训练的投影模块，将科学编码器接入语言模型。分子图、谱图、晶体结构、蛋白质与核酸序列以及科学信号被映射到语言模型的输入空间，使其能够生成自然语言分析和结构化科学答案。投影模块按任务分别训练。

## 整体框架

<p align="center">
  <img src="assets/framework.gif" alt="科学输入经科学编码器与可训练投影模块，接入冻结的语言模型。" width="100%">
</p>

## 演示

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="assets/spectra.gif" alt="三谱联合输入、流式解析与预测的分子结构。" width="100%"><br>
      <b>三谱联合 → 分子结构</b><br>
      <sub>红外、拉曼与紫外—可见光谱，配合流式解析和历史预测回放。</sub>
    </td>
    <td width="50%" align="center">
      <img src="assets/protein.gif" alt="蛋白质序列位置与界面参考标注。" width="100%"><br>
      <b>蛋白质界面位点</b><br>
      <sub>序列位置与逐残基界面参考标注。</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="assets/crystal.gif" alt="晶体几何结构及其形成能参考值。" width="100%"><br>
      <b>晶体结构与形成能</b><br>
      <sub>原子几何结构与材料性质参考值。</sub>
    </td>
    <td width="50%" align="center">
      <img src="assets/rna-iterations.gif" alt="RNA 接入方案实验与评测反馈回放。" width="100%"><br>
      <b>RNA 接入方案迭代</b><br>
      <sub>根据实验反馈修订接入方案。</sub>
    </td>
  </tr>
</table>

## 评测结果

以下为各任务独立 checkpoint 的部分评测结果，按生成答案判分。

| 榜单 | 任务 | 指标 ↑ | 得分 |
|---|---|---|---:|
| QM9S | 三谱联合分子结构识别 | Acc@1（%） | **49.75** |
| JARVIS-DFT | 形成能预测 | MAD/MAE | **15.03** |
| MPBind，assembly-1 重建集 | PPI 界面位点预测 | 逐蛋白平均 F1（%） | **61.12** |
| SciTS PHU01 | 心电分类 | 宏平均 F1（%） | **71.53** |
| SciTS NEU06 | 睡眠分期 | 宏平均 F1（%） | **72.01** |
| BEACON ncRNA | RNA 家族分类 | 准确率（%） | **97.35** |

## 模型

投影模块权重将在 [Hugging Face](https://huggingface.co/internlm/Sage-SciPerception) 发布。
