<!-- <template>
  <div>
    <h1>Favorite Articles</h1>
    <ul>
      <li v-for="articleId in favoriteArticles" :key="articleId">
        <Article :articleId="articleId" :dict="props.dict" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const favoriteKey = 'favorite_articles';
const favoriteArticles = ref(JSON.parse(localStorage.getItem(favoriteKey)) || []);
</script> -->
