import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';

// Tokens Studio transforms 등록
register(StyleDictionary, { excludeParentKeys: true });

const sd = new StyleDictionary({
  source: ['token/**/*.json'],
  preprocessors: ['tokens-studio'], // Tokens Studio 전처리기

  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'], // 변수명을 kebab-case로 변환
      buildPath: 'src/styles/tokens/',

      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            outputReferences: true, // 토큰 참조를 CSS var()로 유지
          },
        },
      ],
    },
  },

  log: {
    warnings: 'warn',
    verbosity: 'verbose',
    errors: {
      brokenReferences: 'console', // 참조 에러를 콘솔에 출력
    },
  },
});

await sd.buildAllPlatforms();
