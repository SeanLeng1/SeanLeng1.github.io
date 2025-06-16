---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
years: [2025, 2024]
---
<!-- https://github.com/erikthedeveloper/code-review-emoji-guide -->

<!-- Include the modal component -->
{% include deadlines-modal.html %}

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

I am currently a first-year MSML student at Carnegie Mellon University advised by [Prof. William W. Cohen](https://www.cs.cmu.edu/~wcohen/). Previously, I completed my undergraduate studies in Computer Science at University of Rochester, where I had the privilege of being advised by [Prof. Jiebo Luo](https://www.cs.rochester.edu/u/jluo/#Prospective). I have also collaborated with [Prof. Haohan Wang](https://haohanwang.github.io/) at UIUC [DREAM Lab](https://dreamlabuiuc.github.io/).

In the summer of 2024, I was a visiting researcher at Washington University in St. Louis with [Prof. Jiaxin Huang](https://teapot123.github.io/). Currently, for summer 2025, I am a Student Researcher at Google Research advised by [Dr. Si Si](https://research.google/people/105487/).

My research interests lie in improving training and inference efficiency as well as model alignment of both <span style="color:rgb(144, 174, 200)">**LLMs**</span> and <span style="color:lightpink">**VLMs**</span>. 

Feel free to email me if you are interested in **collaborating or discussing research ideas**.

<!-- My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top international AI conferences with total <a href='https://scholar.google.com/citations?user=Jyqbex4AAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a>  -->

<!-- (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=Jyqbex4AAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>). -->

<!-- <span style="color:red">🔈**I am actively seeking for 2025 Summer HCI Research Internship, please don’t hesitate to contact me if you think I might be a good fit!**</span> -->

<span class='anchor' id='-news'></span>

# 🔥 News
- *2025.06*: &nbsp;🎉🎉 New preprints ["Semi-structured LLM Reasoners Can Be Rigorously Audited"](https://arxiv.org/abs/2505.24217) and ["PosS:Position Specialist Generates Better Draft for Speculative Decoding"](https://arxiv.org/abs/2506.03566) is out on arxiv. Code is also released.
- *2025.05*: &nbsp;🎓🎓 I will join Google Research as a Student Researcher for summer 2025.
- *2025.04*: &nbsp;🎉🎉 New preprint ["CrossWordBench: Evaluating the Reasoning Capabilities of LLMs and LVLMs with Controllable Puzzle Generation"](https://arxiv.org/abs/2504.00043) is out on arxiv. Dataset and Code are also released.
- *2025.02*: &nbsp;🎉🎉 One paper ["Taming Overconfidence in LLMs: Reward Calibration in RLHF"](https://arxiv.org/abs/2410.09724) is accepted by ICLR 2025 (poster).
- *2024.10*: &nbsp;🎉🎉 New preprint: ["Taming Overconfidence in LLMs: Reward Calibration in RLHF"](https://arxiv.org/abs/2410.09724) is out on arxiv. Code is also released.
- *2024.09*: &nbsp;🎉🎉 One paper ["S<sup>2</sup>FT: Efficient, Scalable and Generalizable LLM Fine-tuning by Structured Sparsity"](https://openreview.net/forum?id=lEUle8S4xQ&referrer=%5Bthe%20profile%20of%20Xinyu%20Yang%5D) is accepted by NIPS 2024 (poster).
- *2024.08*: &nbsp;📚📚 I will start my Master in Machine Learning at Carnegie Mellon University.

<!-- - *2024.05*: &nbsp;🎉🎉 ["Development of UroSAM: A Machine Learning Model to Automatically Identify Kidney Stone Composition from Endoscopic Video"](https://www.liebertpub.com/doi/10.1089/end.2023.0740) is accepted for publication at Journal of Endourology. -->

<span class='anchor' id='-education'></span>

# 📖 Educations
- *2024.08 - Present*, M.S. in Machine Learning, Carnegie Mellon University, USA
- *2020.08 - 2024.05*, B.S. in Computer Science, University of Rochester, USA

<span class='anchor' id='-publications'></span>

# 📝 Publications (* denotes equal contribution) {#publications}

<div class="publications">
  {% for y in page.years %}
    <div>{{ y }}</div>
    {% bibliography -f papers -q @*[year={{y}}] %}
  {% endfor %}
</div>

<span class='anchor' id='-research'></span>

# 🔬 Research Experience
- *2025.06 - Present*, Student Researcher, Google Research, advised by [Dr. Si Si](https://research.google/people/105487/).
- *2025.01 - 2025.05*, Independent Study, Carnegie Mellon University, advised by [Prof. William W. Cohen](https://www.cs.cmu.edu/~wcohen/).
- *2024.06 - Present*, Visiting Researcher (Onsite during summer), Washington University in St. Louis, advised by [Prof. Jiaxin Huang](https://teapot123.github.io/).
- *2023.12 - 2024.05*, Honor Independent Study, [VIStA (Visual Intelligence & Social Multimedia Analytics)](https://www.cs.rochester.edu/u/jluo/\#VISTA), advised by [Prof. Jiebo Luo](https://www.cs.rochester.edu/u/jluo/) and [Dr. Rajat K. Jain](https://www.urmc.rochester.edu/people/112361798-rajat-k-jain).
- *2022.12 - 2024.05*, Research Internship (Remote), [Dream Lab iSchool UIUC](https://dreamlabuiuc.github.io/\#intro), advised by [Prof. Haohan Wang](https://haohanwang.github.io/)

<span class='anchor' id='-service'></span>

# 📝 Service
- *2024.10 - Present*, TMLR reviewer.
- *2022.01 - 2023.05*, Teaching Assistant for CSC261/461: Database System, University of Rochester.

<!-- 🛠️ Skills -->


<!-- Contact -->
<link rel="stylesheet" href="{{ '/assets/css/contact-form.css' | relative_url }}">
{% include contact-form.html %}
<script src="{{ '/assets/js/contact-form.js' | relative_url }}"></script>

<!-- Music -->
{% include netease.html %}


<!-- <script src="{{ '/assets/js/webPet.min.js' | relative_url }}"></script> -->
<!-- Initialize the WebPet -->
<!-- <script>
  document.addEventListener('DOMContentLoaded', function() {
    const pet = new WebPet({
      name: 'Kitty',
      // Add any additional custom configurations here
    });
  });
</script> -->