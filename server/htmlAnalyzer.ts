/**
 * HTML Analyzer Service
 * Performs deep analysis of HTML content to extract structure, visual design,
 * functionality, and purpose for comprehensive idea generation
 */

import * as cheerio from 'cheerio';

export interface HTMLAnalysis {
  structure: {
    semanticElements: Array<{type: string, content: string, attributes: Record<string, string>}>;
    navigation: Array<{text: string, href: string, level: number}>;
    forms: Array<{action: string, method: string, fields: Array<{name: string, type: string, label: string}>}>;
    interactiveElements: Array<{type: string, text: string, purpose: string}>;
  };
  visual: {
    colors: {primary: string, secondary: string, background: string, text: string, accent: string[]};
    typography: {fontFamilies: string[], sizes: string[], weights: string[]};
    layout: {type: string, patterns: string[], responsive: boolean};
    components: Array<{name: string, classes: string[], purpose: string}>;
    cssClasses: Array<{name: string, frequency: number, likelyPurpose: string}>;
  };
  functional: {
    features: Array<{name: string, evidence: string, confidence: string}>;
    userFlows: Array<{flow: string, steps: string[]}>;
    dataStructures: Array<{type: string, fields: string[]}>;
    integrations: string[];
  };
  purpose: {
    meta: {title: string, description: string, keywords: string[]};
    valueProposition: string;
    targetAudience: string;
    problemStatement: string;
    solutionStatement: string;
    ctaTexts: string[];
  };
  rawContent: {
    text: string;
    headings: Array<{level: number, text: string}>;
    links: Array<{text: string, href: string}>;
    paragraphs?: string[];
    buttons?: string[];
    formFields?: Array<{label: string, type: string, placeholder: string}>;
  };
}

export class HTMLAnalyzer {
  /**
   * Analyze HTML content and extract comprehensive information
   */
  async analyze(htmlContent: string): Promise<HTMLAnalysis> {
    if (!htmlContent || htmlContent.trim().length === 0) {
      throw new Error('HTML content is empty');
    }

    let $: cheerio.CheerioAPI;
    try {
      $ = cheerio.load(htmlContent, {
        decodeEntities: true,
        normalizeWhitespace: false,
      });
    } catch (error) {
      throw new Error(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate that we have some content
    const bodyText = $('body').text() || $('html').text() || htmlContent;
    if (bodyText.trim().length < 10) {
      throw new Error('HTML content appears to be empty or invalid');
    }
    
    try {
      return {
        structure: this.analyzeStructure($),
        visual: this.analyzeVisual($, htmlContent),
        functional: this.analyzeFunctional($),
        purpose: this.analyzePurpose($),
        rawContent: this.extractRawContent($),
      };
    } catch (error) {
      console.error('[HTML Analyzer] Error during analysis:', error);
      // Return minimal analysis rather than failing completely
      return {
        structure: {
          semanticElements: [],
          navigation: [],
          forms: [],
          interactiveElements: [],
        },
        visual: {
          colors: { primary: '#000000', secondary: '#666666', background: '#ffffff', text: '#000000', accent: [] },
          typography: { fontFamilies: [], sizes: [], weights: [] },
          layout: { type: 'standard', patterns: [], responsive: false },
          components: [],
          cssClasses: [],
        },
        functional: {
          features: [],
          userFlows: [],
          dataStructures: [],
          integrations: [],
        },
        purpose: {
          meta: { title: '', description: '', keywords: [] },
          valueProposition: bodyText.substring(0, 500),
          targetAudience: 'General users',
          problemStatement: 'Problem statement not found',
          solutionStatement: 'Solution statement not found',
          ctaTexts: [],
        },
        rawContent: {
          text: bodyText.substring(0, 10000),
          headings: [],
          links: [],
          paragraphs: [],
          buttons: [],
          formFields: [],
        },
      };
    }
  }

  /**
   * Analyze HTML structure
   */
  private analyzeStructure($: cheerio.CheerioAPI) {
    const semanticElements: Array<{type: string, content: string, attributes: Record<string, string>}> = [];
    const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer', 'form', 'table'];
    
    semanticTags.forEach(tag => {
      $(tag).each((_, el) => {
        const $el = $(el);
        const attrs: Record<string, string> = {};
        Object.keys(el.attribs || {}).forEach(key => {
          attrs[key] = el.attribs[key];
        });
        semanticElements.push({
          type: tag,
          content: $el.text().substring(0, 200),
          attributes: attrs,
        });
      });
    });

    // Extract navigation
    const navigation: Array<{text: string, href: string, level: number}> = [];
    $('nav a, header a, .nav a, .navigation a').each((_, el) => {
      const $el = $(el);
      navigation.push({
        text: $el.text().trim(),
        href: $el.attr('href') || '#',
        level: this.getNavLevel($el),
      });
    });

    // Extract forms
    const forms: Array<{action: string, method: string, fields: Array<{name: string, type: string, label: string}>}> = [];
    $('form').each((_, formEl) => {
      const $form = $(formEl);
      const fields: Array<{name: string, type: string, label: string}> = [];
      
      $form.find('input, select, textarea').each((_, fieldEl) => {
        const $field = $(fieldEl);
        const name = $field.attr('name') || $field.attr('id') || '';
        const type = $field.attr('type') || fieldEl.tagName.toLowerCase();
        const label = $field.closest('label').text() || 
                     $form.find(`label[for="${$field.attr('id')}"]`).text() ||
                     $field.attr('placeholder') || '';
        
        fields.push({ name, type, label: label.trim() });
      });
      
      forms.push({
        action: $form.attr('action') || '',
        method: $form.attr('method') || 'get',
        fields,
      });
    });

    // Extract interactive elements
    const interactiveElements: Array<{type: string, text: string, purpose: string}> = [];
    $('button, a[href], input[type="submit"], input[type="button"]').each((_, el) => {
      const $el = $(el);
      const type = el.tagName.toLowerCase();
      const text = $el.text().trim() || $el.attr('aria-label') || $el.attr('title') || '';
      const purpose = this.inferPurpose($el, type);
      
      interactiveElements.push({ type, text, purpose });
    });

    return {
      semanticElements,
      navigation,
      forms,
      interactiveElements,
    };
  }

  /**
   * Analyze visual design - comprehensive visibility analysis
   */
  private analyzeVisual($: cheerio.CheerioAPI, htmlContent: string) {
    // Extract colors from inline styles and style tags
    const colors = this.extractColors($, htmlContent);
    
    // Extract typography
    const typography = this.extractTypography($, htmlContent);
    
    // Analyze layout patterns
    const baseLayout = this.analyzeLayout($);
    
    // Analyze CSS classes
    const cssClasses = this.analyzeCSSClasses($);
    
    // Identify components
    const components = this.identifyComponents($);
    
    // Analyze page structure and visibility
    const pageStructure = {
      hasHero: $('.hero, [class*="hero"], section:first-child, [class*="banner"]').length > 0,
      hasSidebar: $('.sidebar, aside, [class*="sidebar"]').length > 0,
      hasFooter: $('footer, .footer, [class*="footer"]').length > 0,
      hasNavigation: $('nav, .nav, .navigation, [class*="nav"], header').length > 0,
      hasHeader: $('header, .header, [class*="header"]').length > 0,
      layoutType: this.detectLayoutType($),
      visualHierarchy: this.analyzeVisualHierarchy($),
    };
    
    // Analyze responsive design details
    const responsiveDetails = {
      hasViewportMeta: $('meta[name="viewport"]').length > 0,
      breakpoints: this.extractBreakpoints(htmlContent),
      mobileOptimized: this.checkMobileOptimization($),
    };

    return {
      colors,
      typography,
      layout: { ...baseLayout, ...pageStructure, responsive: responsiveDetails },
      components,
      cssClasses,
    };
  }

  /**
   * Extract color scheme
   */
  private extractColors($: cheerio.CheerioAPI, htmlContent: string) {
    const colorSet = new Set<string>();
    const accentColors: string[] = [];
    
    // Extract from inline styles
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const colorMatches = style.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
      if (colorMatches) {
        colorMatches.forEach(c => colorSet.add(c));
      }
    });
    
    // Extract from style tags
    $('style').each((_, el) => {
      const css = $(el).html() || '';
      const colorMatches = css.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
      if (colorMatches) {
        colorMatches.forEach(c => {
          colorSet.add(c);
          accentColors.push(c);
        });
      }
    });
    
    // Extract common color patterns from class names
    $('[class*="color"], [class*="bg-"], [class*="text-"]').each((_, el) => {
      const classes = $(el).attr('class') || '';
      const colorMatch = classes.match(/(?:color|bg|text)-([a-z]+-\d+|primary|secondary|accent)/);
      if (colorMatch) {
        accentColors.push(colorMatch[1]);
      }
    });
    
    const colorArray = Array.from(colorSet);
    return {
      primary: colorArray[0] || '#000000',
      secondary: colorArray[1] || '#666666',
      background: this.findBackgroundColor($, colorArray),
      text: this.findTextColor($, colorArray),
      accent: accentColors.slice(0, 5),
    };
  }

  /**
   * Extract typography information
   */
  private extractTypography($: cheerio.CheerioAPI, htmlContent: string) {
    const fontFamilies = new Set<string>();
    const sizes = new Set<string>();
    const weights = new Set<string>();
    
    // Extract from inline styles
    $('[style*="font"]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const fontMatch = style.match(/font-family:\s*([^;]+)/i);
      const sizeMatch = style.match(/font-size:\s*([^;]+)/i);
      const weightMatch = style.match(/font-weight:\s*([^;]+)/i);
      
      if (fontMatch) fontFamilies.add(fontMatch[1].trim().replace(/['"]/g, ''));
      if (sizeMatch) sizes.add(sizeMatch[1].trim());
      if (weightMatch) weights.add(weightMatch[1].trim());
    });
    
    // Extract from style tags
    $('style').each((_, el) => {
      const css = $(el).html() || '';
      const fontMatches = css.match(/font-family:\s*([^;]+)/gi);
      const sizeMatches = css.match(/font-size:\s*([^;]+)/gi);
      const weightMatches = css.match(/font-weight:\s*([^;]+)/gi);
      
      if (fontMatches) {
        fontMatches.forEach(m => {
          const match = m.match(/font-family:\s*(.+)/i);
          if (match) fontFamilies.add(match[1].trim().replace(/['"]/g, ''));
        });
      }
      if (sizeMatches) {
        sizeMatches.forEach(m => {
          const match = m.match(/font-size:\s*(.+)/i);
          if (match) sizes.add(match[1].trim());
        });
      }
      if (weightMatches) {
        weightMatches.forEach(m => {
          const match = m.match(/font-weight:\s*(.+)/i);
          if (match) weights.add(match[1].trim());
        });
      }
    });
    
    return {
      fontFamilies: Array.from(fontFamilies).slice(0, 5),
      sizes: Array.from(sizes).slice(0, 10),
      weights: Array.from(weights).slice(0, 5),
    };
  }

  /**
   * Analyze layout patterns
   */
  private analyzeLayout($: cheerio.CheerioAPI) {
    const patterns: string[] = [];
    let responsive = false;
    
    // Check for grid/flexbox patterns
    $('[class*="grid"], [class*="flex"], [style*="grid"], [style*="flex"]').each((_, el) => {
      const classes = $(el).attr('class') || '';
      const style = $(el).attr('style') || '';
      
      if (classes.includes('grid') || style.includes('grid')) {
        patterns.push('grid');
      }
      if (classes.includes('flex') || style.includes('flex')) {
        patterns.push('flexbox');
      }
    });
    
    // Check for responsive design
    if ($('meta[name="viewport"]').length > 0) {
      responsive = true;
      patterns.push('responsive');
    }
    
    // Check for common layout classes
    const layoutClasses = ['container', 'wrapper', 'sidebar', 'header', 'footer', 'main', 'content'];
    layoutClasses.forEach(cls => {
      if ($(`.${cls}, [class*="${cls}"]`).length > 0) {
        patterns.push(cls);
      }
    });
    
    return {
      type: patterns[0] || 'standard',
      patterns: [...new Set(patterns)],
      responsive,
    };
  }

  /**
   * Analyze CSS classes for patterns
   */
  private analyzeCSSClasses($: cheerio.CheerioAPI) {
    const classFrequency = new Map<string, number>();
    
    $('[class]').each((_, el) => {
      const classes = $(el).attr('class')?.split(/\s+/) || [];
      classes.forEach(cls => {
        if (cls.trim()) {
          classFrequency.set(cls, (classFrequency.get(cls) || 0) + 1);
        }
      });
    });
    
    const cssClasses = Array.from(classFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, frequency]) => ({
        name,
        frequency,
        likelyPurpose: this.inferClassPurpose(name),
      }));
    
    return cssClasses;
  }

  /**
   * Identify UI components
   */
  private identifyComponents($: cheerio.CheerioAPI) {
    const components: Array<{name: string, classes: string[], purpose: string}> = [];
    
    const componentPatterns = [
      { pattern: /card|panel|box/i, name: 'Card', purpose: 'Content container' },
      { pattern: /modal|dialog|popup/i, name: 'Modal', purpose: 'Overlay dialog' },
      { pattern: /dropdown|select|menu/i, name: 'Dropdown', purpose: 'Selection menu' },
      { pattern: /tab/i, name: 'Tab', purpose: 'Tabbed navigation' },
      { pattern: /accordion|collapse/i, name: 'Accordion', purpose: 'Collapsible content' },
      { pattern: /button|btn/i, name: 'Button', purpose: 'Action trigger' },
      { pattern: /form/i, name: 'Form', purpose: 'Data input' },
      { pattern: /table/i, name: 'Table', purpose: 'Data display' },
      { pattern: /carousel|slider/i, name: 'Carousel', purpose: 'Image/content slider' },
      { pattern: /nav|navigation/i, name: 'Navigation', purpose: 'Site navigation' },
    ];
    
    componentPatterns.forEach(({ pattern, name, purpose }) => {
      const elements = $(`[class*="${pattern.source.replace(/[\/\^$]/g, '')}"], [id*="${pattern.source.replace(/[\/\^$]/g, '')}"]`);
      if (elements.length > 0) {
        elements.slice(0, 1).each((_, el) => {
          const classes = ($(el).attr('class') || '').split(/\s+/).filter(c => c.trim());
          components.push({ name, classes, purpose });
        });
      }
    });
    
    return components;
  }

  /**
   * Analyze functional aspects - comprehensive functionality detection
   */
  private analyzeFunctional($: cheerio.CheerioAPI) {
    const features: Array<{name: string, evidence: string, confidence: string}> = [];
    const userFlows: Array<{flow: string, steps: string[]}> = [];
    const dataStructures: Array<{type: string, fields: string[]}> = [];
    const integrations: string[] = [];
    
    // Detect authentication/login features
    const authFeatures = this.detectAuthFeatures($);
    features.push(...authFeatures);
    
    // Detect e-commerce features
    const ecommerceFeatures = this.detectEcommerceFeatures($);
    features.push(...ecommerceFeatures);
    
    // Detect CMS/content management features
    const cmsFeatures = this.detectCMSFeatures($);
    features.push(...cmsFeatures);
    
    // Detect social features
    const socialFeatures = this.detectSocialFeatures($);
    features.push(...socialFeatures);
    
    // Detect analytics/tracking
    const analyticsFeatures = this.detectAnalyticsFeatures($);
    features.push(...analyticsFeatures);
    
    // Detect search functionality
    if ($('input[type="search"], [class*="search"], form[action*="search"], [placeholder*="search" i]').length > 0) {
      features.push({
        name: 'Search Functionality',
        evidence: 'Search input fields or search forms found',
        confidence: 'high',
      });
    }
    
    // Detect data tables
    $('table').each((_, el) => {
      const $table = $(el);
      const headers: string[] = [];
      $table.find('th').each((_, th) => {
        headers.push($(th).text().trim());
      });
      if (headers.length > 0) {
        dataStructures.push({
          type: 'table',
          fields: headers,
        });
      }
    });
    
    // Detect API endpoints and integrations
    const apiEndpoints = this.extractAPIEndpoints($);
    integrations.push(...apiEndpoints);
    
    // Analyze user workflows more deeply
    const detailedUserFlows = this.analyzeUserWorkflows($);
    userFlows.push(...detailedUserFlows);
    
    return {
      features,
      userFlows,
      dataStructures,
      integrations: [...new Set(integrations)].slice(0, 20),
    };
  }
  
  /**
   * Detect authentication features
   */
  private detectAuthFeatures($: cheerio.CheerioAPI): Array<{name: string, evidence: string, confidence: string}> {
    const features: Array<{name: string, evidence: string, confidence: string}> = [];
    
    if ($('form[action*="login"], form[action*="signin"], input[type="password"], [class*="login"], [class*="signin"]').length > 0) {
      features.push({
        name: 'User Authentication',
        evidence: 'Login forms or authentication-related elements found',
        confidence: 'high',
      });
    }
    
    if ($('[class*="signup"], [class*="register"], form[action*="register"], form[action*="signup"]').length > 0) {
      features.push({
        name: 'User Registration',
        evidence: 'Signup/registration forms found',
        confidence: 'high',
      });
    }
    
    if ($('[class*="profile"], [class*="account"], [class*="settings"], [href*="profile"], [href*="account"]').length > 0) {
      features.push({
        name: 'User Profiles',
        evidence: 'Profile or account management elements found',
        confidence: 'medium',
      });
    }
    
    return features;
  }
  
  /**
   * Detect e-commerce features
   */
  private detectEcommerceFeatures($: cheerio.CheerioAPI): Array<{name: string, evidence: string, confidence: string}> {
    const features: Array<{name: string, evidence: string, confidence: string}> = [];
    
    if ($('[class*="cart"], [class*="checkout"], [class*="product"], [class*="price"], [class*="buy"], [class*="add-to-cart"]').length > 0) {
      features.push({
        name: 'E-commerce',
        evidence: 'Shopping cart, product listings, or checkout elements found',
        confidence: 'high',
      });
    }
    
    if ($('[class*="payment"], [class*="stripe"], [class*="paypal"], [data-payment]').length > 0) {
      features.push({
        name: 'Payment Processing',
        evidence: 'Payment-related elements or integrations found',
        confidence: 'high',
      });
    }
    
    if ($('[class*="review"], [class*="rating"], [class*="star"]').length > 0) {
      features.push({
        name: 'Product Reviews/Ratings',
        evidence: 'Review or rating system found',
        confidence: 'medium',
      });
    }
    
    return features;
  }
  
  /**
   * Detect CMS/content management features
   */
  private detectCMSFeatures($: cheerio.CheerioAPI): Array<{name: string, evidence: string, confidence: string}> {
    const features: Array<{name: string, evidence: string, confidence: string}> = [];
    
    if ($('article, .post, .blog-post, [class*="blog"]').length > 0) {
      features.push({
        name: 'Content Management/Blog',
        evidence: 'Blog posts or article structures found',
        confidence: 'high',
      });
    }
    
    if ($('[class*="editor"], [contenteditable], [class*="wysiwyg"]').length > 0) {
      features.push({
        name: 'Rich Text Editor',
        evidence: 'Content editor elements found',
        confidence: 'medium',
      });
    }
    
    return features;
  }
  
  /**
   * Detect social features
   */
  private detectSocialFeatures($: cheerio.CheerioAPI): Array<{name: string, evidence: string, confidence: string}> {
    const features: Array<{name: string, evidence: string, confidence: string}> = [];
    
    if ($('[class*="share"], [class*="social"], [data-share], a[href*="twitter"], a[href*="facebook"]').length > 0) {
      features.push({
        name: 'Social Sharing',
        evidence: 'Social media sharing buttons or links found',
        confidence: 'high',
      });
    }
    
    if ($('[class*="comment"], [class*="discussion"], form[action*="comment"]').length > 0) {
      features.push({
        name: 'Comments/Discussions',
        evidence: 'Comment or discussion features found',
        confidence: 'medium',
      });
    }
    
    return features;
  }
  
  /**
   * Detect analytics/tracking features
   */
  private detectAnalyticsFeatures($: cheerio.CheerioAPI): Array<{name: string, evidence: string, confidence: string}> {
    const features: Array<{name: string, evidence: string, confidence: string}> = [];
    
    if ($('script[src*="analytics"], script[src*="gtag"], script[src*="ga.js"], script[src*="google-analytics"]').length > 0) {
      features.push({
        name: 'Analytics Tracking',
        evidence: 'Google Analytics or similar tracking scripts found',
        confidence: 'high',
      });
    }
    
    return features;
  }
  
  /**
   * Extract API endpoints
   */
  private extractAPIEndpoints($: cheerio.CheerioAPI): string[] {
    const endpoints: string[] = [];
    
    // From form actions
    $('form[action]').each((_, el) => {
      const action = $(el).attr('action') || '';
      if (action.includes('/api/') || action.startsWith('http')) {
        endpoints.push(action);
      }
    });
    
    // From links
    $('a[href*="/api/"], [data-api], [data-endpoint]').each((_, el) => {
      const href = $(el).attr('href') || $(el).attr('data-api') || $(el).attr('data-endpoint') || '';
      if (href) endpoints.push(href);
    });
    
    // From data attributes
    $('[data-action], [data-url]').each((_, el) => {
      const url = $(el).attr('data-action') || $(el).attr('data-url') || '';
      if (url.includes('/api/') || url.startsWith('http')) {
        endpoints.push(url);
      }
    });
    
    return endpoints;
  }
  
  /**
   * Analyze user workflows
   */
  private analyzeUserWorkflows($: cheerio.CheerioAPI): Array<{flow: string, steps: string[]}> {
    const workflows: Array<{flow: string, steps: string[]}> = [];
    
    // Navigation flow
    const navLinks = $('nav a, .nav a, header a').map((_, el) => $(el).text().trim()).get().filter(t => t);
    if (navLinks.length > 0) {
      workflows.push({
        flow: 'Navigation Flow',
        steps: navLinks.slice(0, 15),
      });
    }
    
    // Form submission flow
    const forms = $('form');
    if (forms.length > 0) {
      const formSteps: string[] = [];
      forms.each((_, form) => {
        const action = $(form).attr('action') || 'Submit form';
        const method = $(form).attr('method') || 'POST';
        formSteps.push(`${method.toUpperCase()} to ${action}`);
      });
      if (formSteps.length > 0) {
        workflows.push({
          flow: 'Form Submission Flow',
          steps: formSteps,
        });
      }
    }
    
    // Button/CTA flow
    const ctaButtons = $('button, [role="button"], a[class*="button"], a[class*="cta"]').map((_, el) => {
      return $(el).text().trim() || $(el).attr('aria-label') || '';
    }).get().filter(t => t);
    if (ctaButtons.length > 0) {
      workflows.push({
        flow: 'Call-to-Action Flow',
        steps: [...new Set(ctaButtons)].slice(0, 10),
      });
    }
    
    return workflows;
  }

  /**
   * Analyze purpose and value proposition
   */
  private analyzePurpose($: cheerio.CheerioAPI) {
    // Extract meta tags
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '';
    const keywords = ($('meta[name="keywords"]').attr('content') || '').split(',').map(k => k.trim()).filter(k => k);
    
    // Extract value proposition from hero section
    const heroText = $('h1').first().text() + ' ' + $('.hero, .hero-section, [class*="hero"]').text();
    const valueProposition = heroText.substring(0, 500);
    
    // Extract target audience indicators
    const targetAudience = this.inferTargetAudience($);
    
    // Extract problem/solution from content
    const problemStatement = this.extractProblemStatement($);
    const solutionStatement = this.extractSolutionStatement($);
    
    // Extract CTAs
    const ctaTexts: string[] = [];
    $('button, a[class*="cta"], a[class*="button"], [class*="call-to-action"]').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 100) {
        ctaTexts.push(text);
      }
    });
    
    return {
      meta: { title, description, keywords },
      valueProposition,
      targetAudience,
      problemStatement,
      solutionStatement,
      ctaTexts: [...new Set(ctaTexts)].slice(0, 10),
    };
  }

  /**
   * Extract raw content - comprehensive extraction of ALL content
   */
  private extractRawContent($: cheerio.CheerioAPI) {
    // Clone body to avoid modifying original
    const body = $('body').clone();
    
    // Remove script, style, and noscript tags before extracting text
    body.find('script, style, noscript, iframe').remove();
    
    // Extract comprehensive text content (no artificial limit)
    const text = body.text()
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract ALL headings hierarchy
    const headings: Array<{level: number, text: string}> = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const level = parseInt(el.tagName.charAt(1));
      const headingText = $(el).text().trim();
      if (headingText) {
        headings.push({
          level,
          text: headingText,
        });
      }
    });
    
    // Extract ALL paragraphs and meaningful content sections
    const paragraphs: string[] = [];
    $('p, section, article, div[class*="content"], div[class*="text"], div[class*="description"], li').each((_, el) => {
      const text = $(el).text().trim();
      // Only include meaningful paragraphs (more than 20 chars)
      if (text.length > 20 && !text.match(/^\d+$/)) {
        paragraphs.push(text);
      }
    });
    
    // Extract ALL links (not limited to 50)
    const links: Array<{text: string, href: string}> = [];
    $('a[href]').each((_, el) => {
      const $el = $(el);
      const linkText = $el.text().trim();
      const href = $el.attr('href') || '#';
      // Include all links, not just navigation
      links.push({
        text: linkText || href,
        href: href,
      });
    });
    
    // Extract button text and CTAs
    const buttons: string[] = [];
    $('button, [role="button"], input[type="submit"], input[type="button"], a[class*="button"], a[class*="btn"]').each((_, el) => {
      const buttonText = $(el).text().trim() || $(el).attr('aria-label') || $(el).attr('title') || '';
      if (buttonText) {
        buttons.push(buttonText);
      }
    });
    
    // Extract form labels and placeholders
    const formFields: Array<{label: string, type: string, placeholder: string}> = [];
    $('input, select, textarea').each((_, el) => {
      const $el = $(el);
      const label = $el.closest('label').text().trim() || 
                   $el.siblings('label').text().trim() ||
                   $el.attr('aria-label') || '';
      const type = $el.attr('type') || el.tagName.toLowerCase();
      const placeholder = $el.attr('placeholder') || '';
      if (label || placeholder) {
        formFields.push({ label, type, placeholder });
      }
    });
    
    return {
      text: text, // Full text, no artificial limit
      headings,
      links: links, // All links
      paragraphs: paragraphs.slice(0, 200), // Top 200 paragraphs
      buttons: [...new Set(buttons)], // Unique buttons
      formFields: formFields.slice(0, 50), // Form fields
    };
  }

  // Helper methods
  
  private getNavLevel($el: cheerio.Cheerio<cheerio.Element>): number {
    let level = 1;
    let parent = $el.parent();
    while (parent.length > 0 && parent[0]?.tagName !== 'body') {
      if (parent.is('nav, ul, ol')) level++;
      parent = parent.parent();
    }
    return level;
  }

  private inferPurpose($el: cheerio.Cheerio<cheerio.Element>, type: string): string {
    const text = $el.text().toLowerCase();
    const classes = ($el.attr('class') || '').toLowerCase();
    const href = $el.attr('href') || '';
    
    if (text.includes('sign up') || text.includes('register') || classes.includes('signup')) return 'User Registration';
    if (text.includes('login') || text.includes('sign in') || classes.includes('login')) return 'User Authentication';
    if (text.includes('buy') || text.includes('purchase') || text.includes('cart') || classes.includes('cart')) return 'E-commerce Purchase';
    if (text.includes('download') || text.includes('get started')) return 'Lead Generation';
    if (text.includes('learn more') || text.includes('read more')) return 'Content Engagement';
    if (href.startsWith('mailto:')) return 'Contact';
    if (href.startsWith('tel:')) return 'Phone Contact';
    return 'Navigation';
  }

  private findBackgroundColor($: cheerio.CheerioAPI, colors: string[]): string {
    const bgColors = $('body, [class*="bg-"], [style*="background"]').map((_, el) => {
      const style = $(el).attr('style') || '';
      const bgMatch = style.match(/background(?:-color)?:\s*([^;]+)/i);
      return bgMatch ? bgMatch[1].trim() : null;
    }).get().filter(c => c);
    
    return bgColors[0] || colors[0] || '#ffffff';
  }

  private findTextColor($: cheerio.CheerioAPI, colors: string[]): string {
    const textColors = $('[style*="color"]').map((_, el) => {
      const style = $(el).attr('style') || '';
      const colorMatch = style.match(/color:\s*([^;]+)/i);
      return colorMatch ? colorMatch[1].trim() : null;
    }).get().filter(c => c);
    
    return textColors[0] || colors[1] || '#000000';
  }

  private inferClassPurpose(className: string): string {
    const lower = className.toLowerCase();
    if (lower.includes('btn') || lower.includes('button')) return 'Button component';
    if (lower.includes('card') || lower.includes('panel')) return 'Card/Container';
    if (lower.includes('nav') || lower.includes('menu')) return 'Navigation';
    if (lower.includes('form') || lower.includes('input')) return 'Form element';
    if (lower.includes('modal') || lower.includes('dialog')) return 'Modal/Dialog';
    if (lower.includes('header') || lower.includes('footer')) return 'Layout section';
    if (lower.includes('grid') || lower.includes('flex')) return 'Layout system';
    if (lower.includes('text') || lower.includes('heading')) return 'Typography';
    if (lower.includes('color') || lower.includes('bg')) return 'Styling';
    return 'General component';
  }

  private inferTargetAudience($: cheerio.CheerioAPI): string {
    const content = $('body').text().toLowerCase();
    const meta = $('meta[name="description"]').attr('content')?.toLowerCase() || '';
    const combined = content + ' ' + meta;
    
    if (combined.includes('business') || combined.includes('b2b') || combined.includes('enterprise')) {
      return 'Business professionals and enterprises';
    }
    if (combined.includes('developer') || combined.includes('programmer') || combined.includes('coding')) {
      return 'Developers and technical professionals';
    }
    if (combined.includes('student') || combined.includes('education') || combined.includes('learn')) {
      return 'Students and learners';
    }
    if (combined.includes('health') || combined.includes('medical') || combined.includes('wellness')) {
      return 'Health-conscious individuals';
    }
    if (combined.includes('finance') || combined.includes('money') || combined.includes('investment')) {
      return 'Financial professionals and investors';
    }
    return 'General consumers';
  }

  private extractProblemStatement($: cheerio.CheerioAPI): string {
    const problemKeywords = ['problem', 'challenge', 'pain', 'struggle', 'difficulty', 'issue'];
    let problemText = '';
    
    $('h2, h3, p, section').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (problemKeywords.some(keyword => text.includes(keyword))) {
        problemText += $(el).text() + ' ';
      }
    });
    
    return problemText.substring(0, 500).trim() || 'Problem statement not explicitly found in content';
  }

  private extractSolutionStatement($: cheerio.CheerioAPI): string {
    const solutionKeywords = ['solution', 'solve', 'help', 'enable', 'provide', 'offer'];
    let solutionText = '';
    
    $('h2, h3, p, section').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (solutionKeywords.some(keyword => text.includes(keyword))) {
        solutionText += $(el).text() + ' ';
      }
    });
    
    return solutionText.substring(0, 500).trim() || 'Solution statement not explicitly found in content';
  }
  
  /**
   * Detect layout type (landing page, dashboard, blog, etc.)
   */
  private detectLayoutType($: cheerio.CheerioAPI): string {
    const bodyClasses = ($('body').attr('class') || '').toLowerCase();
    
    if (bodyClasses.includes('landing') || bodyClasses.includes('homepage')) return 'landing-page';
    if ($('.dashboard, [class*="dashboard"]').length > 0) return 'dashboard';
    if ($('article, .post, .blog-post').length > 0) return 'blog';
    if ($('.product, [class*="product"], [class*="shop"]').length > 0) return 'e-commerce';
    if ($('.app, [class*="app"], [data-app]').length > 0) return 'web-app';
    if ($('.portfolio, [class*="portfolio"]').length > 0) return 'portfolio';
    
    return 'standard';
  }
  
  /**
   * Analyze visual hierarchy (what users see first, second, etc.)
   */
  private analyzeVisualHierarchy($: cheerio.CheerioAPI): string {
    const hierarchy: string[] = [];
    
    // Check for hero section
    if ($('.hero, [class*="hero"], section:first-child h1').length > 0) {
      hierarchy.push('Hero section with main headline');
    }
    
    // Check for navigation prominence
    if ($('nav, .nav').length > 0) {
      hierarchy.push('Prominent navigation');
    }
    
    // Check for feature sections
    if ($('.features, [class*="feature"], .benefits, [class*="benefit"]').length > 0) {
      hierarchy.push('Feature/benefit sections');
    }
    
    // Check for testimonials/social proof
    if ($('.testimonial, [class*="testimonial"], .review, [class*="review"]').length > 0) {
      hierarchy.push('Social proof/testimonials');
    }
    
    // Check for CTA prominence
    if ($('.cta, [class*="cta"], button, [class*="button"]').length > 3) {
      hierarchy.push('Multiple call-to-actions');
    }
    
    return hierarchy.join(', ') || 'Standard content flow';
  }
  
  /**
   * Extract CSS breakpoints from style tags
   */
  private extractBreakpoints(htmlContent: string): string[] {
    const breakpoints: string[] = [];
    const mediaQueryRegex = /@media\s+[^{]*\{/g;
    const matches = htmlContent.match(mediaQueryRegex);
    
    if (matches) {
      matches.forEach(match => {
        if (match.includes('min-width') || match.includes('max-width')) {
          breakpoints.push(match.substring(0, 100));
        }
      });
    }
    
    return breakpoints.slice(0, 5);
  }
  
  /**
   * Check if site is mobile optimized
   */
  private checkMobileOptimization($: cheerio.CheerioAPI): boolean {
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    const hasMobileMenu = $('.mobile-menu, [class*="mobile"], [class*="hamburger"]').length > 0;
    const hasTouchTargets = $('[class*="touch"], [class*="tap"]').length > 0;
    
    return viewport.includes('width=device-width') || hasMobileMenu || hasTouchTargets;
  }
}

export const htmlAnalyzer = new HTMLAnalyzer();

