$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outputPath = Join-Path $root "ATSForge_Project_Presentation_IIMT_Redesigned.pptx"
$logoPath = Join-Path $root "resume-builder\public\atsforge-logo.png"
$resumeImagePath = Join-Path $root "resume-builder\public\Anshu_Prasad_Resume_page-0001.png"
$coverLetterImagePath = Join-Path $root "resume-builder\public\Cover_Letter_Anshu_Prasad_Process_Analyst_page-0001.jpg"

$ppLayoutBlank = 12
$msoFalse = 0
$msoTrue = -1
$msoShapeRectangle = 1
$msoShapeRoundedRectangle = 5
$msoShapeOval = 9
$msoTextOrientationHorizontal = 1
$ppAlignLeft = 1
$ppAlignCenter = 2
$ppAlignRight = 3

function RGB-Color([int]$r, [int]$g, [int]$b) {
  return $r + ($g -shl 8) + ($b -shl 16)
}

$COLORS = @{
  bg = RGB-Color 10 18 32
  bg2 = RGB-Color 17 28 46
  card = RGB-Color 21 37 60
  card2 = RGB-Color 28 45 72
  teal = RGB-Color 37 211 196
  tealSoft = RGB-Color 154 237 226
  orange = RGB-Color 255 138 76
  gold = RGB-Color 255 194 102
  white = RGB-Color 244 247 251
  ink = RGB-Color 217 227 240
  muted = RGB-Color 150 169 194
  line = RGB-Color 52 77 112
  green = RGB-Color 102 224 169
  red = RGB-Color 255 109 109
}

function Add-TextBox {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [string]$text,
    [int]$fontSize = 20,
    [int]$color = 0,
    [string]$fontName = "Aptos",
    [switch]$Bold,
    [switch]$Italic,
    [int]$align = 1,
    [single]$margin = 6
  )
  $shape = $slide.Shapes.AddTextbox($msoTextOrientationHorizontal, $left, $top, $width, $height)
  $shape.TextFrame.TextRange.Text = $text
  $shape.TextFrame.MarginLeft = $margin
  $shape.TextFrame.MarginRight = $margin
  $shape.TextFrame.MarginTop = $margin / 2
  $shape.TextFrame.MarginBottom = $margin / 2
  $shape.TextFrame.WordWrap = $msoTrue
  $shape.Line.Visible = $msoFalse
  $shape.Fill.Visible = $msoFalse
  $shape.TextFrame.TextRange.Font.Name = $fontName
  $shape.TextFrame.TextRange.Font.Size = $fontSize
  $shape.TextFrame.TextRange.Font.Bold = $(if ($Bold) { $msoTrue } else { $msoFalse })
  $shape.TextFrame.TextRange.Font.Italic = $(if ($Italic) { $msoTrue } else { $msoFalse })
  $shape.TextFrame.TextRange.Font.Color.RGB = $color
  $shape.TextFrame.TextRange.ParagraphFormat.Alignment = $align
  return $shape
}

function Add-Card {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [int]$fill,
    [int]$line,
    [single]$transparency = 0.06
  )
  $shape = $slide.Shapes.AddShape($msoShapeRoundedRectangle, $left, $top, $width, $height)
  $shape.Fill.ForeColor.RGB = $fill
  $shape.Fill.Transparency = $transparency
  $shape.Line.ForeColor.RGB = $line
  $shape.Line.Weight = 1.2
  return $shape
}

function Add-Bar {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [int]$fill
  )
  $shape = $slide.Shapes.AddShape($msoShapeRectangle, $left, $top, $width, $height)
  $shape.Fill.ForeColor.RGB = $fill
  $shape.Line.Visible = $msoFalse
  return $shape
}

function Add-Background {
  param($slide)
  $bg = $slide.Shapes.AddShape($msoShapeRectangle, 0, 0, 960, 540)
  $bg.Fill.ForeColor.RGB = $COLORS.bg
  $bg.Line.Visible = $msoFalse

  $band = $slide.Shapes.AddShape($msoShapeRectangle, 0, 0, 960, 62)
  $band.Fill.ForeColor.RGB = $COLORS.bg2
  $band.Line.Visible = $msoFalse

  $oval1 = $slide.Shapes.AddShape($msoShapeOval, 760, -80, 260, 260)
  $oval1.Fill.ForeColor.RGB = $COLORS.teal
  $oval1.Fill.Transparency = 0.82
  $oval1.Line.Visible = $msoFalse

  $oval2 = $slide.Shapes.AddShape($msoShapeOval, -70, 390, 220, 220)
  $oval2.Fill.ForeColor.RGB = $COLORS.orange
  $oval2.Fill.Transparency = 0.9
  $oval2.Line.Visible = $msoFalse

  $grid = $slide.Shapes.AddShape($msoShapeRectangle, 705, 74, 185, 2)
  $grid.Fill.ForeColor.RGB = $COLORS.line
  $grid.Line.Visible = $msoFalse
}

function Add-Header {
  param(
    $slide,
    [string]$kicker,
    [string]$title,
    [string]$subtitle,
    [int]$number
  )
  $pill = Add-Card $slide 44 23 150 24 $COLORS.card2 $COLORS.line 0.0
  $pill.Fill.ForeColor.RGB = $COLORS.card2
  Add-TextBox $slide 48 23 142 22 $kicker 10 $COLORS.tealSoft "Aptos" -Bold -align $ppAlignCenter | Out-Null
  Add-TextBox $slide 42 86 520 38 $title 28 $COLORS.white "Aptos Display" -Bold | Out-Null
  if ($subtitle) {
    Add-TextBox $slide 44 126 640 34 $subtitle 12 $COLORS.muted "Aptos" -align $ppAlignLeft | Out-Null
  }
  Add-TextBox $slide 900 24 30 20 ([string]$number) 12 $COLORS.muted "Aptos" -Bold -align $ppAlignRight | Out-Null
}

function Add-BulletsText {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [string[]]$items,
    [int]$fontSize = 16,
    [int]$color = 0
  )
  $text = ($items | ForEach-Object { "• $_" }) -join "`r`n"
  Add-TextBox $slide $left $top $width $height $text $fontSize $color "Aptos" -align $ppAlignLeft
}

function Add-ImageSafe {
  param(
    $slide,
    [string]$path,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height
  )
  if (Test-Path $path) {
    return $slide.Shapes.AddPicture($path, $msoFalse, $msoTrue, $left, $top, $width, $height)
  }
  return $null
}

function Add-StatCard {
  param(
    $slide,
    [double]$left,
    [double]$top,
    [double]$width,
    [double]$height,
    [string]$value,
    [string]$label,
    [int]$accent
  )
  Add-Card $slide $left $top $width $height $COLORS.card $COLORS.line 0.02 | Out-Null
  Add-TextBox $slide ($left + 8) ($top + 10) ($width - 16) 36 $value 22 $accent "Aptos Display" -Bold | Out-Null
  Add-TextBox $slide ($left + 8) ($top + 42) ($width - 16) 44 $label 11 $COLORS.ink "Aptos" | Out-Null
}

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$presentation = $pp.Presentations.Add()
$presentation.PageSetup.SlideWidth = 960
$presentation.PageSetup.SlideHeight = 540

# Slide 1
$slide = $presentation.Slides.Add(1, $ppLayoutBlank)
Add-Background $slide
Add-TextBox $slide 52 48 190 24 "PROJECT PRESENTATION" 12 $COLORS.tealSoft "Aptos" -Bold | Out-Null
Add-TextBox $slide 52 96 560 88 "ATSForge: AI-Powered Career Management Platform" 30 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 52 178 510 46 "Resume Builder, ATS Scoring, JD Match, Cover Letters, Outreach, and Browser-Based LaTeX Editing" 15 $COLORS.ink "Aptos" | Out-Null
Add-ImageSafe $slide $logoPath 690 62 180 180 | Out-Null
Add-Card $slide 52 286 260 134 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 332 286 260 134 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 612 286 248 134 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 68 302 226 20 "Presented By" 11 $COLORS.gold "Aptos" -Bold | Out-Null
Add-TextBox $slide 68 330 226 60 "Anshu Prasad`r`nDeepak Yadav" 20 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 348 302 226 20 "Program" 11 $COLORS.gold "Aptos" -Bold | Out-Null
Add-TextBox $slide 348 330 226 56 "B.Tech CSE (AI)`r`n8th Semester" 20 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 628 302 214 20 "Project Guide" 11 $COLORS.gold "Aptos" -Bold | Out-Null
Add-TextBox $slide 628 330 214 56 "Ajay Pratap Singh Yadav`r`nAssistant Professor" 17 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 54 470 520 22 "Department of Computer Science and Engineering (Artificial Intelligence)" 12 $COLORS.muted "Aptos" | Out-Null

# Slide 2
$slide = $presentation.Slides.Add(2, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "DECK FLOW" "A stronger research narrative from slide 2 onward" "Rebuilt around the paper, the current ATS scoring code, and the actual product modules." 2
Add-Card $slide 46 180 270 92 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 344 180 270 92 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 642 180 270 92 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 46 300 270 92 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 344 300 270 92 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 642 300 270 92 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 64 198 230 22 "1. Abstract and Introduction" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 64 226 230 36 "Problem context, ATS reality, and why the platform is needed." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 362 198 230 22 "2. Research Gap" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 362 226 230 36 "Fragmented tools, opaque scores, and weak JD alignment." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 660 198 230 22 "3. Platform Modules" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 660 226 230 36 "Resume Builder, JD Match, Cover Letters, Outreach, and LaTeX." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 64 318 230 22 "4. General ATS Score" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 64 346 230 36 "Five-factor model used in the current implementation." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 362 318 230 22 "5. JD Match Score" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 362 346 230 36 "Separate role-specific score with requirement risk analysis." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 660 318 230 22 "6. Results and Scope" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 660 346 230 36 "Latency, ATS improvement, time saving, and future work." 12 $COLORS.ink "Aptos" | Out-Null

# Slide 3
$slide = $presentation.Slides.Add(3, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "ABSTRACT" "ATSForge turns fragmented job-application tasks into one AI-assisted workflow" "The abstract is rewritten using the paper's core claims and the current prototype structure." 3
Add-Card $slide 46 170 520 286 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 62 188 488 230 "Job applications are increasingly filtered by Applicant Tracking Systems before a recruiter reads the resume, yet most candidates still work across disconnected tools for resume writing, keyword checking, cover-letter drafting, and outreach. ATSForge addresses this gap through a unified web platform that shares one structured resume object across all modules.`r`n`r`nThe platform combines a general ATS-readiness score, a separate JD-specific match score, AI-generated cover letters and outreach content, and a browser-based LaTeX workflow. In the paper evaluation, ATS optimization improved average scores by 36.3 points across 30 job descriptions, reduced application-preparation time from 67.4 minutes to 4.8 minutes, and delivered resume parsing in under 2 seconds through Groq-hosted LLaMA inference." 16 $COLORS.ink "Aptos" | Out-Null
Add-StatCard $slide 600 178 148 86 "+36.3" "average ATS score improvement after JD-guided optimization" $COLORS.green
Add-StatCard $slide 764 178 148 86 "67.4 -> 4.8 min" "application preparation time reduced with the integrated workflow" $COLORS.orange
Add-StatCard $slide 600 278 148 86 "< 2 sec" "resume parsing latency using Groq LPU inference" $COLORS.teal
Add-StatCard $slide 764 278 148 86 "30 JDs" "evaluation set across five domains for ATS optimization" $COLORS.gold
Add-StatCard $slide 600 378 312 78 "Shared ResumeData Schema" "one structured resume object powers scoring, JD analysis, letters, outreach, and LaTeX export" $COLORS.tealSoft

# Slide 4
$slide = $presentation.Slides.Add(4, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "INTRODUCTION" "The hiring pipeline rejects many candidates before human review begins" "ATSForge is positioned as a response to automated filtering, fragmented tooling, and slow application preparation." 4
Add-Card $slide 46 178 408 250 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 484 178 428 250 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 62 196 180 20 "Current hiring reality" 12 $COLORS.gold "Aptos" -Bold | Out-Null
Add-BulletsText $slide 62 224 366 184 @(
  "Most large employers use ATS software to parse, filter, and rank resumes before recruiter review.",
  "Candidates lose opportunities because of formatting issues, missing evidence, weak keyword coverage, or poor role alignment.",
  "Public tools often show one opaque number, so users do not know what to fix first."
) 15 $COLORS.ink | Out-Null
Add-TextBox $slide 500 196 200 20 "What ATSForge changes" 12 $COLORS.gold "Aptos" -Bold | Out-Null
Add-BulletsText $slide 500 224 386 184 @(
  "Build or upload a resume into a shared structured schema.",
  "Measure general ATS readiness and job-specific fit on separate scoring pages.",
  "Convert the same resume context into cover letters, outreach drafts, and LaTeX-ready output."
) 15 $COLORS.ink | Out-Null
Add-Bar $slide 76 448 806 6 $COLORS.teal | Out-Null
Add-TextBox $slide 76 458 806 26 "From fragmented career tools to one connected intelligence layer for the full application workflow." 14 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null

# Slide 5
$slide = $presentation.Slides.Add(5, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "PROBLEM STATEMENT" "The real problem is not only resume writing; it is the lack of interpretable, role-aware guidance" "This slide reframes the problem section as a research gap rather than a generic need statement." 5
Add-Card $slide 46 180 205 126 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 269 180 205 126 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 492 180 205 126 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 715 180 205 126 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 60 196 176 20 "Opaque scoring" 17 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 60 224 176 64 "Many tools return a single percentage without showing whether the issue is structure, evidence, keywords, or language." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 283 196 176 20 "Fragmented workflow" 17 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 283 224 176 64 "Resume builders, JD checkers, cover-letter tools, and outreach drafts usually live on separate platforms." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 506 196 176 20 "Weak role alignment" 17 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 506 224 176 64 "A resume can look polished yet still miss critical job requirements, title alignment, or evidence placement." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 729 196 176 20 "Low actionability" 17 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 729 224 176 64 "Users need targeted fixes such as where to add skills, what bullets to strengthen, and which gaps are critical." 12 $COLORS.ink "Aptos" | Out-Null
Add-Card $slide 46 334 874 108 $COLORS.card2 $COLORS.line 0.0 | Out-Null
Add-TextBox $slide 66 360 834 54 "Research gap: existing systems rarely combine transparent ATS diagnostics, JD-aware semantic matching, and downstream content generation inside one shared resume architecture." 18 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null

# Slide 6
$slide = $presentation.Slides.Add(6, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "OBJECTIVES + CONTRIBUTIONS" "The system is designed as both a product workflow and a scoring research artifact" "Objectives explain what ATSForge does; contributions explain what this project adds academically." 6
Add-Card $slide 46 178 404 274 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 480 178 432 274 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 62 196 190 20 "Objectives" 12 $COLORS.gold "Aptos" -Bold | Out-Null
Add-BulletsText $slide 62 224 362 202 @(
  "Create a structured resume builder with live preview and ATS-oriented feedback.",
  "Separate general resume quality from job-specific match quality.",
  "Use one shared resume schema across Resume Builder, JD Match, Cover Letter, Outreach, and LaTeX Editor.",
  "Reduce time, friction, and duplication in the full application workflow."
) 15 $COLORS.ink | Out-Null
Add-TextBox $slide 496 196 240 20 "Main contributions" 12 $COLORS.gold "Aptos" -Bold | Out-Null
Add-BulletsText $slide 496 224 390 202 @(
  "A five-factor general ATS score in the current implementation: SC, AE, KS, PS, and LQ.",
  "A separate four-factor JD Match score with requirement weighting, semantic equivalence, title alignment, and critical-gap risk.",
  "A serverless architecture that combines Groq LPU inference, Supabase storage, and browser-based LaTeX compilation."
) 15 $COLORS.ink | Out-Null

# Slide 7
$slide = $presentation.Slides.Add(7, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "PLATFORM MODULES" "ATSForge is not one tool; it is a connected module stack built on shared resume data" "These cards explain the current product modules more clearly than the old overview slide." 7
Add-Card $slide 44 172 280 102 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 340 172 280 102 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 636 172 280 102 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 44 294 280 102 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 340 294 280 102 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 636 294 280 102 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 60 188 248 20 "Resume Builder" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 60 218 248 40 "Manual editing, upload parsing, live preview, export, and general ATS scoring." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 356 188 248 20 "JD Match Analyzer" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 356 218 248 40 "Extracts requirements, scores role fit, flags exact, related, and missing evidence." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 652 188 248 20 "Cover Letter Writer" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 652 218 248 40 "Generates job-aware letters using shared resume context and overlapping skills." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 60 310 248 20 "Outreach Generator" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 60 340 248 40 "Creates cold emails and LinkedIn messages using a concise networking structure." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 356 310 248 20 "LaTeX Editor" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 356 340 248 40 "Compiles professional LaTeX resumes in the browser through a proxy workflow." 12 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 652 310 248 20 "Job Portals Hub" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 652 340 248 40 "A curated board directory that keeps job discovery inside the same platform ecosystem." 12 $COLORS.ink "Aptos" | Out-Null
Add-ImageSafe $slide $logoPath 792 64 116 116 | Out-Null

# Slide 8
$slide = $presentation.Slides.Add(8, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "GENERAL ATS SCORE" "Current implementation: five-factor hybrid ATS model for overall resume readiness" "This is the broad ATS score shown inside the Resume Builder, independent of any one job description." 8
Add-Card $slide 46 168 414 292 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 64 190 378 24 "Formula" 12 $COLORS.gold "Aptos" -Bold | Out-Null
Add-TextBox $slide 64 222 378 58 "ATS = 0.22SC + 0.26AE + 0.18KS + 0.18PS + 0.16LQ" 24 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 64 296 378 138 @(
  "SC = Section Completeness",
  "AE = Action and Evidence",
  "KS = Keyword Spread",
  "PS = Parse Safety",
  "LQ = Language Quality"
) 15 $COLORS.ink | Out-Null
Add-Bar $slide 500 184 240 18 $COLORS.orange | Out-Null
Add-Bar $slide 500 228 220 18 $COLORS.teal | Out-Null
Add-Bar $slide 500 272 180 18 $COLORS.gold | Out-Null
Add-Bar $slide 500 316 180 18 $COLORS.green | Out-Null
Add-Bar $slide 500 360 160 18 $COLORS.tealSoft | Out-Null
Add-TextBox $slide 752 180 130 20 "AE 26%" 16 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 752 224 130 20 "SC 22%" 16 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 752 268 130 20 "KS 18%" 16 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 752 312 130 20 "PS 18%" 16 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 752 356 130 20 "LQ 16%" 16 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 500 402 388 48 "Interpretation: the model rewards evidence-heavy content most, while still balancing structural coverage, keyword distribution, parser safety, and writing quality." 13 $COLORS.ink "Aptos" | Out-Null

# Slide 9
$slide = $presentation.Slides.Add(9, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "FACTOR CONTRIBUTION" "What each of the five ATS factors actually measures" "This slide explains how every factor contributes to the final ATS score." 9
Add-Card $slide 42 166 170 286 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 224 166 170 286 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 406 166 170 286 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 588 166 170 286 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 770 166 148 286 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 54 182 146 20 "SC" 22 $COLORS.teal "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-BulletsText $slide 52 216 150 210 @("Personal details","Summary","Skills","Experience","Education","Projects","Credentials") 11 $COLORS.ink | Out-Null
Add-TextBox $slide 236 182 146 20 "AE" 22 $COLORS.orange "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-BulletsText $slide 234 216 150 210 @("Quantified impact","Strong action verbs","Outcome language","Result-driven bullets") 11 $COLORS.ink | Out-Null
Add-TextBox $slide 418 182 146 20 "KS" 22 $COLORS.gold "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-BulletsText $slide 416 216 150 210 @("Role keywords","Density","Cross-section spread","Skills + evidence alignment") 11 $COLORS.ink | Out-Null
Add-TextBox $slide 600 182 146 20 "PS" 22 $COLORS.green "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-BulletsText $slide 598 216 150 210 @("Date consistency","Links and headings","Bullet validity","Word count","Parse confidence") 11 $COLORS.ink | Out-Null
Add-TextBox $slide 782 182 124 20 "LQ" 22 $COLORS.tealSoft "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-BulletsText $slide 778 216 130 210 @("Duplicate phrasing","Buzzwords","Placeholders","Clarity","Specificity") 11 $COLORS.ink | Out-Null

# Slide 10
$slide = $presentation.Slides.Add(10, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "JD MATCH SCORE" "Separate page: role-specific ATS fit for a particular job description" "This score is different from the general ATS score because it measures alignment to one target role." 10
Add-Card $slide 46 170 404 286 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 64 190 372 24 "Formula" 12 $COLORS.gold "Aptos" -Bold | Out-Null
Add-TextBox $slide 64 220 372 62 "JD Match = 0.50WKC + 0.20SE + 0.15TA + 0.15CR" 22 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 64 296 372 136 @(
  "WKC = Weighted Keyword Coverage",
  "SE = Semantic Equivalence",
  "TA = Title Alignment",
  "CR = Critical Requirement Coverage / Risk"
) 15 $COLORS.ink | Out-Null
Add-Card $slide 482 170 430 130 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 500 188 392 20 "How it works" 12 $COLORS.gold "Aptos" -Bold | Out-Null
Add-TextBox $slide 500 216 392 58 "JD text -> structured requirements -> exact / related / missing evidence -> targeted recommendations" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-Card $slide 482 316 430 140 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-BulletsText $slide 500 334 392 94 @(
  "Must-have requirements carry more weight than preferred or nice-to-have items.",
  "The analyzer also recommends where missing evidence should be added in the resume.",
  "Critical gaps are surfaced separately so the user knows what blocks the role fit most."
) 13 $COLORS.ink | Out-Null

# Slide 11
$slide = $presentation.Slides.Add(11, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "HYBRID WORKFLOW" "The hybrid idea combines structured scoring, AI inference, and shared resume memory" "This architecture slide also explains why the modules remain consistent with each other." 11
Add-Card $slide 44 192 154 82 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 226 192 154 82 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 408 192 154 82 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 590 148 154 82 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 590 258 154 82 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 772 148 144 82 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 772 258 144 82 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 60 214 122 36 "Upload or build resume" 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-TextBox $slide 242 214 122 36 "Shared ResumeData schema" 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-TextBox $slide 424 214 122 36 "Groq + rules + scoring logic" 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-TextBox $slide 606 172 122 36 "General ATS score" 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-TextBox $slide 606 282 122 36 "JD Match score" 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-TextBox $slide 788 172 112 36 "Letters + outreach" 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-TextBox $slide 788 282 112 36 "LaTeX + export" 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-Bar $slide 198 230 24 4 $COLORS.teal | Out-Null
Add-Bar $slide 380 230 24 4 $COLORS.teal | Out-Null
Add-Bar $slide 562 188 24 4 $COLORS.teal | Out-Null
Add-Bar $slide 562 298 24 4 $COLORS.teal | Out-Null
Add-Bar $slide 744 188 24 4 $COLORS.orange | Out-Null
Add-Bar $slide 744 298 24 4 $COLORS.orange | Out-Null
Add-Card $slide 44 388 872 74 $COLORS.card2 $COLORS.line 0.0 | Out-Null
Add-TextBox $slide 68 408 824 38 "Why it is hybrid: heuristic ATS diagnostics measure structural quality, AI parsing captures semantics, and one shared schema keeps every downstream module synchronized." 17 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null

# Slide 12
$slide = $presentation.Slides.Add(12, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "MODULE 1: RESUME BUILDER" "The Resume Builder is the main editing and scoring workspace" "It supports manual creation, upload parsing, live preview, export, and factor-level ATS feedback." 12
Add-Card $slide 46 168 300 310 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-ImageSafe $slide $resumeImagePath 64 188 264 272 | Out-Null
Add-Card $slide 376 168 536 310 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-BulletsText $slide 396 196 496 230 @(
  "Users can create a resume section by section or upload a PDF/DOCX for AI-assisted parsing.",
  "The platform calculates the general ATS score continuously while the user edits the content.",
  "Factor-level diagnostics show whether the problem comes from completeness, evidence, keywords, parse safety, or language quality.",
  "The same resume data is reused by JD Match, cover letters, outreach, and LaTeX export."
) 16 $COLORS.ink | Out-Null

# Slide 13
$slide = $presentation.Slides.Add(13, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "MODULES 2 + 3" "JD Match and Cover Letter generation turn resume content into role-specific application material" "The first module diagnoses gaps; the second converts aligned evidence into a customized letter." 13
Add-Card $slide 46 172 432 294 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 64 192 190 20 "JD Match Analyzer" 20 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 64 226 394 176 @(
  "Converts the job description into structured requirements with importance levels and aliases.",
  "Separates exact matches, related matches, and missing requirements.",
  "Maps missing evidence back to the best resume section for revision.",
  "Produces a score that is role-specific rather than generic."
) 15 $COLORS.ink | Out-Null
Add-Card $slide 506 172 406 294 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-ImageSafe $slide $coverLetterImagePath 526 200 160 232 | Out-Null
Add-TextBox $slide 704 192 184 20 "Cover Letter Writer" 20 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 704 226 184 176 @(
  "Uses shared resume data and JD overlap.",
  "Highlights the strongest matching skills.",
  "Produces less generic letters than template-only tools."
) 13 $COLORS.ink | Out-Null

# Slide 14
$slide = $presentation.Slides.Add(14, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "MODULES 4 + 5" "Outreach generation and the LaTeX editor extend ATSForge beyond resume scoring" "These modules support networking and polished final output without leaving the platform." 14
Add-Card $slide 46 178 414 278 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 64 198 200 20 "Outreach Generator" 20 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 64 230 374 160 @(
  "Generates cold emails and LinkedIn messages from the same resume context.",
  "Keeps outreach concise and targeted instead of generic networking text.",
  "Helps users move from document preparation to actual recruiter communication."
) 15 $COLORS.ink | Out-Null
Add-Card $slide 490 178 422 278 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 508 198 190 20 "LaTeX Editor" 20 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 508 230 386 126 @(
  "Compiles LaTeX resumes in the browser through a proxy to texlive.net.",
  "Avoids local TeX installation while still supporting professional resume templates.",
  "Fits advanced users who want precise formatting control."
) 15 $COLORS.ink | Out-Null
Add-Card $slide 526 356 350 72 $COLORS.bg2 $COLORS.line 0.0 | Out-Null
Add-TextBox $slide 548 374 306 34 "\documentclass{resume}`r`\begin{document}`r`  ATS-ready output with browser compilation" 14 $COLORS.tealSoft "Consolas" -Bold | Out-Null

# Slide 15
$slide = $presentation.Slides.Add(15, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "RESULTS + EVALUATION" "The paper shows gains in speed, ATS improvement, and workflow efficiency" "These results are the strongest evidence section for the presentation, so the slide is now more quantitative." 15
Add-StatCard $slide 48 178 192 92 "1.82s vs 20.1s" "resume parsing latency: Groq LPU compared with A100 baseline" $COLORS.teal
Add-StatCard $slide 258 178 192 92 "278ms vs 3.1s" "first-token latency for AI responses" $COLORS.orange
Add-StatCard $slide 468 178 192 92 "+36.3 pts" "average ATS score improvement after JD-guided optimization" $COLORS.green
Add-StatCard $slide 678 178 234 92 "67.4 -> 4.8 min" "manual application preparation time reduced by the integrated workflow" $COLORS.gold
Add-Card $slide 48 296 864 146 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-BulletsText $slide 68 322 824 96 @(
  "Evaluation used 30 job descriptions across five fields: Software Engineering, Data Science, Product Management, Marketing, and Finance.",
  "The main user-facing win is not only a higher score but a faster revise-check-generate loop across all modules.",
  "The results support ATSForge as both a productivity tool and a more interpretable ATS-improvement framework."
) 15 $COLORS.ink | Out-Null

# Slide 16
$slide = $presentation.Slides.Add(16, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "CONCLUSION" "ATSForge is stronger when presented as a connected, role-aware career system" "The conclusion now ties the product story, research contribution, and future scope together." 16
Add-Card $slide 46 180 270 236 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 344 180 270 236 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-Card $slide 642 180 270 236 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 62 198 238 20 "Key takeaway" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-TextBox $slide 62 232 238 126 "ATSForge combines resume editing, ATS diagnostics, JD alignment, and content generation in one coherent workflow instead of forcing users to switch tools." 14 $COLORS.ink "Aptos" | Out-Null
Add-TextBox $slide 360 198 238 20 "Future scope" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 358 232 242 140 @("Recruiter-side validation","More industries and larger datasets","Multilingual support","Visual LaTeX editing mode") 14 $COLORS.ink | Out-Null
Add-TextBox $slide 658 198 238 20 "SDG alignment" 18 $COLORS.white "Aptos Display" -Bold | Out-Null
Add-BulletsText $slide 656 232 242 140 @("SDG 4: career readiness","SDG 8: employability support","SDG 9: practical AI infrastructure") 14 $COLORS.ink | Out-Null

# Slide 17
$slide = $presentation.Slides.Add(17, $ppLayoutBlank)
Add-Background $slide
Add-Header $slide "REFERENCES" "Selected references from the working paper" "" 17
Add-Card $slide 46 170 866 302 $COLORS.card $COLORS.line 0.02 | Out-Null
Add-TextBox $slide 62 192 834 248 "[1] J. Bersin, Talent Acquisition Systems 2023: Market Analysis, 2023.`r`n[2] S. Bogen and A. Rieke, Help Wanted: Hiring Algorithms, Equity, and Bias, 2018.`r`n[3] T. Naous et al., Transformer-based NER for Resume Parsing, IEEE ICTAI, 2023.`r`n[4] A. Kumar et al., Automated Resume Parsing Using BERT, 2023.`r`n[5] Y. Chen and B. Liu, GPT-based Personalized Cover Letter Generation, 2022.`r`n[6] Jobscan, How ATS Resume Scanners Work, 2023.`r`n[7] Meta AI, LLaMA 3.3: An Open Foundation Language Model, 2024.`r`n[8] Groq Inc., LPU Inference Engine Whitepaper, 2024." 15 $COLORS.ink "Aptos" | Out-Null

# Slide 18
$slide = $presentation.Slides.Add(18, $ppLayoutBlank)
Add-Background $slide
Add-TextBox $slide 140 188 680 60 "THANK YOU" 34 $COLORS.white "Aptos Display" -Bold -align $ppAlignCenter | Out-Null
Add-TextBox $slide 210 258 540 40 "Questions and discussion" 18 $COLORS.tealSoft "Aptos" -align $ppAlignCenter | Out-Null
Add-ImageSafe $slide $logoPath 390 322 180 120 | Out-Null

$presentation.SaveAs($outputPath)
$presentation.Close()
$pp.Quit()

[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($pp)

Write-Output "Saved redesigned presentation to: $outputPath"
