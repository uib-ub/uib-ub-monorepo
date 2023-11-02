<!-- <template>
  <div>
    <h2>Favorite Articles</h2>
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
