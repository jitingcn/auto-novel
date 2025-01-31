package api.model

import infra.model.WebNovelAttention
import infra.model.WebNovelMetadataOutline
import infra.model.WebNovelType
import kotlinx.serialization.Serializable

@Serializable
data class WebNovelOutlineDto(
    val providerId: String,
    val novelId: String,
    val titleJp: String,
    val titleZh: String?,
    val type: WebNovelType?,
    val attentions: List<WebNovelAttention>,
    val keywords: List<String>,
    val extra: String?,
    val total: Long,
    val jp: Long,
    val baidu: Long,
    val youdao: Long,
    val gpt: Long,
    val sakura: Long,
    val updateAt: Long?,
)

fun WebNovelMetadataOutline.asDto() =
    WebNovelOutlineDto(
        providerId = providerId,
        novelId = novelId,
        titleJp = titleJp,
        titleZh = titleZh,
        type = type,
        attentions = attentions,
        keywords = keywords,
        extra = extra,
        total = total,
        jp = jp,
        baidu = baidu,
        youdao = youdao,
        gpt = gpt,
        sakura = sakura,
        updateAt = updateAt?.epochSeconds,
    )

